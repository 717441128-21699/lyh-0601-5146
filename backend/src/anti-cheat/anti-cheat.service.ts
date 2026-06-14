import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AntiCheatRecord, AntiCheatSeverity, AntiCheatReviewStatus } from './entities/anti-cheat-record.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AntiCheatService {
  private readonly logger = new Logger(AntiCheatService.name);
  private readonly SIMILARITY_THRESHOLD = 85;

  constructor(
    @InjectRepository(AntiCheatRecord)
    private antiCheatRepository: Repository<AntiCheatRecord>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  private computeJaccardSimilarity(tokens1: Set<string>, tokens2: Set<string>): number {
    if (tokens1.size === 0 && tokens2.size === 0) return 100;
    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return (intersection.size / union.size) * 100;
  }

  private tokenize(code: string): Set<string> {
    const cleaned = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/#[^\n]*/g, '')
      .replace(/\d+/g, 'NUM')
      .replace(/['"].*?['"]/g, 'STR');

    const tokens = cleaned.match(/[a-zA-Z_][a-zA-Z0-9_]*|[+\-*/%=<>!&|^~?:;,(){}[\]]/g) || [];
    return new Set(tokens);
  }

  async detectSimilarity(submissionId: number): Promise<void> {
    try {
      const currentSubmission = await this.submissionsRepository.findOne({ where: { id: submissionId } });
      if (!currentSubmission) return;

      const problemId = currentSubmission.problemId;
      const codeHash = currentSubmission.codeHash;
      const code = currentSubmission.code;

      const hashMatches = await this.submissionsRepository.find({
        where: { problemId, codeHash },
      });

      for (const match of hashMatches) {
        if (match.id === submissionId || match.userId === currentSubmission.userId) continue;

        const existingRecord = await this.antiCheatRepository.findOne({
          where: {
            submissionId,
            comparedSubmissionId: match.id,
            problemId,
          },
        });
        if (existingRecord) continue;

        const record = this.antiCheatRepository.create({
          submissionId,
          comparedSubmissionId: match.id,
          problemId,
          userId: currentSubmission.userId,
          comparedUserId: match.userId,
          similarity: 100,
          detectionType: 'hash_match',
          severity: AntiCheatSeverity.CRITICAL,
          codeHash,
          details: {
            reason: 'Exact hash match',
            language: currentSubmission.language,
          },
        });
        await this.antiCheatRepository.save(record);
        this.logger.warn(
          `检测到完全相同的代码: submission=${submissionId} vs ${match.id}, problem=${problemId}`,
        );
      }

      const sameProblemSubmissions = await this.submissionsRepository.find({
        where: { problemId },
        take: 100,
      });

      const currentTokens = this.tokenize(code);

      for (const other of sameProblemSubmissions) {
        if (other.id === submissionId || other.userId === currentSubmission.userId) continue;
        if (other.codeHash === codeHash) continue;

        const otherTokens = this.tokenize(other.code);
        const similarity = this.computeJaccardSimilarity(currentTokens, otherTokens);

        if (similarity >= this.SIMILARITY_THRESHOLD) {
          const existingRecord = await this.antiCheatRepository.findOne({
            where: {
              submissionId,
              comparedSubmissionId: other.id,
              problemId,
            },
          });
          if (existingRecord) continue;

          const severity =
            similarity >= 95
              ? AntiCheatSeverity.CRITICAL
              : similarity >= 90
              ? AntiCheatSeverity.HIGH
              : AntiCheatSeverity.MEDIUM;

          const record = this.antiCheatRepository.create({
            submissionId,
            comparedSubmissionId: other.id,
            problemId,
            userId: currentSubmission.userId,
            comparedUserId: other.userId,
            similarity,
            detectionType: 'token_similarity',
            severity,
            codeHash,
            details: {
              similarity,
              currentTokenCount: currentTokens.size,
              otherTokenCount: otherTokens.size,
              language: currentSubmission.language,
            },
          });
          await this.antiCheatRepository.save(record);

          this.logger.log(
            `检测到相似代码: submission=${submissionId} vs ${other.id}, similarity=${similarity.toFixed(2)}%`,
          );
        }
      }

      await this.notifyAdminsOfSuspiciousRecords(problemId);
    } catch (error) {
      this.logger.error(`反作弊检测失败: ${error.message}`, error.stack);
    }
  }

  private async notifyAdminsOfSuspiciousRecords(problemId: number): Promise<void> {
    try {
      const admins = await this.usersRepository.find({
        where: { role: In([UserRole.ADMIN, UserRole.JUDGE]) as any },
      });

      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          type: NotificationType.CHEATING,
          title: '反作弊警报',
          content: `检测到题目ID ${problemId} 存在可疑的相似代码提交，请前往反作弊记录页面查看详情。`,
          relatedId: problemId,
          link: `/anti-cheat/records?problemId=${problemId}`,
        });
      }
    } catch (error) {
      this.logger.error(`发送管理员通知失败: ${error.message}`);
    }
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    problemId?: number;
    userId?: number;
    severity?: AntiCheatSeverity;
    isHandled?: boolean;
    status?: AntiCheatReviewStatus;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.antiCheatRepository.createQueryBuilder('record');

    if (filters?.problemId) {
      queryBuilder.andWhere('record.problemId = :problemId', { problemId: filters.problemId });
    }
    if (filters?.userId) {
      queryBuilder.andWhere('record.userId = :userId OR record.comparedUserId = :userId', { userId: filters.userId });
    }
    if (filters?.severity) {
      queryBuilder.andWhere('record.severity = :severity', { severity: filters.severity });
    }
    if (filters?.isHandled !== undefined) {
      queryBuilder.andWhere('record.isHandled = :isHandled', { isHandled: filters.isHandled });
    }
    if (filters?.status) {
      queryBuilder.andWhere('record.status = :status', { status: filters.status });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `record.${sortBy}` : 'record.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<AntiCheatRecord> {
    const record = await this.antiCheatRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`反作弊记录ID ${id} 不存在`);
    }
    return record;
  }

  async reviewRecord(
    id: number,
    status: AntiCheatReviewStatus,
    reviewNote: string,
    reviewedBy: number,
  ): Promise<AntiCheatRecord> {
    const record = await this.findOne(id);

    if (!Object.values(AntiCheatReviewStatus).includes(status)) {
      throw new BadRequestException('无效的复核状态');
    }

    record.status = status;
    record.reviewNote = reviewNote;
    record.reviewedBy = reviewedBy;
    record.isHandled = true;

    return this.antiCheatRepository.save(record);
  }

  async handleRecord(id: number, note: string): Promise<AntiCheatRecord> {
    const record = await this.findOne(id);
    record.isHandled = true;
    record.reviewNote = note;
    return this.antiCheatRepository.save(record);
  }

  async getStats() {
    const total = await this.antiCheatRepository.count();
    const unhandled = await this.antiCheatRepository.count({ where: { isHandled: false } });
    const critical = await this.antiCheatRepository.count({ where: { severity: AntiCheatSeverity.CRITICAL } });
    const high = await this.antiCheatRepository.count({ where: { severity: AntiCheatSeverity.HIGH } });
    const medium = await this.antiCheatRepository.count({ where: { severity: AntiCheatSeverity.MEDIUM } });
    const low = await this.antiCheatRepository.count({ where: { severity: AntiCheatSeverity.LOW } });

    return { total, unhandled, bySeverity: { critical, high, medium, low } };
  }
}
