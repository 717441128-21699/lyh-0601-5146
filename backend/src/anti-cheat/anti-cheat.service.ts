import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AntiCheatRecord, AntiCheatSeverity } from './entities/anti-cheat-record.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AntiCheatService {
  private readonly logger = new Logger(AntiCheatService.name);

  constructor(
    @InjectRepository(AntiCheatRecord)
    private antiCheatRepository: Repository<AntiCheatRecord>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
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

  async checkSimilarity(
    submissionId: number,
    problemId: number,
    codeHash: string,
    code: string,
  ): Promise<void> {
    try {
      const currentSubmission = await this.submissionsRepository.findOne({ where: { id: submissionId } });
      if (!currentSubmission) return;

      const hashMatches = await this.submissionsRepository.find({
        where: { problemId, codeHash },
      });

      for (const match of hashMatches) {
        if (match.id === submissionId || match.userId === currentSubmission.userId) continue;

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

        if (similarity >= 70) {
          const severity =
            similarity >= 95
              ? AntiCheatSeverity.CRITICAL
              : similarity >= 85
              ? AntiCheatSeverity.HIGH
              : similarity >= 75
              ? AntiCheatSeverity.MEDIUM
              : AntiCheatSeverity.LOW;

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
    } catch (error) {
      this.logger.error(`反作弊检测失败: ${error.message}`, error.stack);
    }
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    problemId?: number;
    userId?: number;
    severity?: AntiCheatSeverity;
    isHandled?: boolean;
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

  async handleRecord(id: number, note: string): Promise<AntiCheatRecord> {
    const record = await this.findOne(id);
    record.isHandled = true;
    record.handlingNote = note;
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
