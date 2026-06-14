import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Submission, SubmissionStatus, ProgrammingLanguage } from './entities/submission.entity';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProblemsService } from '../problems/problems.service';
import { UsersService } from '../users/users.service';
import { JudgeService } from '../judge/judge.service';
import { AntiCheatService } from '../anti-cheat/anti-cheat.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { ContestStatus } from '../contests/entities/contest.entity';
import { ContestsService } from '../contests/contests.service';
import { RankingsService } from '../rankings/rankings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private problemsService: ProblemsService,
    private usersService: UsersService,
    private judgeService: JudgeService,
    private antiCheatService: AntiCheatService,
    private registrationsService: RegistrationsService,
    private contestsService: ContestsService,
    private rankingsService: RankingsService,
    private notificationsService: NotificationsService,
  ) {}

  private generateCodeHash(code: string, language: ProgrammingLanguage): string {
    const normalizedCode = code.replace(/\s+/g, ' ').trim();
    return crypto.createHash('sha256').update(`${language}:${normalizedCode}`).digest('hex');
  }

  async submit(submitCodeDto: SubmitCodeDto, userId: number): Promise<Submission> {
    const problem = await this.problemsService.findOne(submitCodeDto.problemId);

    if (submitCodeDto.contestId) {
      const contest = await this.contestsService.findOne(submitCodeDto.contestId);
      if (contest.status !== ContestStatus.ONGOING) {
        throw new BadRequestException('竞赛未在进行中');
      }
      if (submitCodeDto.registrationId) {
        const isRegistered = await this.registrationsService.isUserRegistered(
          submitCodeDto.contestId,
          userId,
        );
        if (!(isRegistered as any).isRegistered) {
          throw new BadRequestException('您未报名该竞赛');
        }
      }
    }

    if (!submitCodeDto.code || submitCodeDto.code.trim().length === 0) {
      throw new BadRequestException('代码不能为空');
    }

    const codeHash = this.generateCodeHash(submitCodeDto.code, submitCodeDto.language);

    const submission = this.submissionsRepository.create({
      ...submitCodeDto,
      userId,
      codeHash,
      codeLength: Buffer.byteLength(submitCodeDto.code, 'utf8'),
      status: SubmissionStatus.PENDING,
    });

    const savedSubmission = await this.submissionsRepository.save(submission);

    await this.problemsService.incrementSubmissionCount(submitCodeDto.problemId);
    await this.usersService.incrementSubmissionCount(userId);

    setImmediate(async () => {
      try {
        await this.submissionsRepository.update(savedSubmission.id, {
          status: SubmissionStatus.JUDGING,
        });

        const judgeResult = await this.judgeService.judge({
          problemId: submitCodeDto.problemId,
          language: submitCodeDto.language,
          code: submitCodeDto.code,
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
          testCases: problem.testCases,
        });

        const isAccepted = judgeResult.status === SubmissionStatus.ACCEPTED;
        const score = isAccepted ? problem.score : 0;

        await this.submissionsRepository.update(savedSubmission.id, {
          status: judgeResult.status,
          score,
          executionTime: judgeResult.runTime,
          executionMemory: judgeResult.memoryUsage,
          errorMessage: judgeResult.errorMessage,
          judgeDetails: judgeResult.details,
          isAccepted,
        });

        if (isAccepted) {
          await this.problemsService.incrementAcceptedCount(submitCodeDto.problemId);

          const prevAccepted = await this.submissionsRepository.count({
            where: {
              problemId: submitCodeDto.problemId,
              userId,
              isAccepted: true,
            },
          });
          if (prevAccepted === 0) {
            await this.usersService.incrementSolvedCount(userId);
          }

          if (submitCodeDto.contestId) {
            await this.updateRankingAfterSubmission(
              submitCodeDto.contestId,
              userId,
              submitCodeDto.problemId,
              score,
              judgeResult.runTime,
            );
          }
        }

        await this.notificationsService.create({
          userId,
          type: NotificationType.SCORE,
          title: '评测完成',
          content: `您对题目「${problem.title}」的评测结果：${judgeResult.status}，得分：${score}`,
          relatedId: savedSubmission.id,
          link: `/submissions/${savedSubmission.id}`,
        });

        if (isAccepted) {
          await this.antiCheatService.detectSimilarity(savedSubmission.id);
        }
      } catch (error) {
        await this.submissionsRepository.update(savedSubmission.id, {
          status: SubmissionStatus.SYSTEM_ERROR,
          errorMessage: error.message,
        });
      }
    });

    return this.findOne(savedSubmission.id);
  }

  private async updateRankingAfterSubmission(
    contestId: number,
    userId: number,
    problemId: number,
    score: number,
    timeMs: number,
  ): Promise<void> {
    try {
      const allUserSubmissions = await this.submissionsRepository.find({
        where: { contestId, userId, isAccepted: true },
      });

      const solvedProblemIds = new Set<number>();
      let totalScore = 0;
      let totalTime = Math.floor(timeMs / 1000);

      for (const s of allUserSubmissions) {
        if (!solvedProblemIds.has(s.problemId)) {
          solvedProblemIds.add(s.problemId);
          totalScore += s.score;
          totalTime += Math.floor((s.executionTime || 0) / 1000);
        }
      }

      const registration = await this.registrationsService.findByContestAndUser(contestId, userId);
      if (registration) {
        await this.registrationsService.updateScore(
          registration.id,
          totalScore,
          solvedProblemIds.size,
          totalTime,
        );
      }
    } catch (error) {
      console.error('更新排名失败:', error);
    }
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    problemId?: number;
    userId?: number;
    contestId?: number;
    status?: SubmissionStatus;
    language?: ProgrammingLanguage;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.submissionsRepository.createQueryBuilder('submission');

    if (filters?.problemId) {
      queryBuilder.andWhere('submission.problemId = :problemId', { problemId: filters.problemId });
    }
    if (filters?.userId) {
      queryBuilder.andWhere('submission.userId = :userId', { userId: filters.userId });
    }
    if (filters?.contestId) {
      queryBuilder.andWhere('submission.contestId = :contestId', { contestId: filters.contestId });
    }
    if (filters?.status) {
      queryBuilder.andWhere('submission.status = :status', { status: filters.status });
    }
    if (filters?.language) {
      queryBuilder.andWhere('submission.language = :language', { language: filters.language });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `submission.${sortBy}` : 'submission.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Submission> {
    const submission = await this.submissionsRepository.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException(`提交记录ID ${id} 不存在`);
    }
    return submission;
  }

  async findByUser(userId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { userId });
  }

  async findByProblem(problemId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { problemId });
  }

  async findByContest(contestId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { contestId });
  }

  async getUserSubmissionForProblem(userId: number, problemId: number): Promise<Submission | null> {
    return this.submissionsRepository.findOne({
      where: { userId, problemId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSubmissionStats(problemId?: number, userId?: number) {
    const queryBuilder = this.submissionsRepository.createQueryBuilder('submission');

    if (problemId) {
      queryBuilder.andWhere('submission.problemId = :problemId', { problemId });
    }
    if (userId) {
      queryBuilder.andWhere('submission.userId = :userId', { userId });
    }

    const total = await queryBuilder.getCount();
    const accepted = await queryBuilder.andWhere('submission.isAccepted = :isAccepted', { isAccepted: true }).getCount();

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(SubmissionStatus)) {
      const count = await this.submissionsRepository.count({ where: { status, ...(problemId ? { problemId } : {}), ...(userId ? { userId } : {}) } });
      if (count > 0) byStatus[status] = count;
    }

    return { total, accepted, byStatus };
  }
}
