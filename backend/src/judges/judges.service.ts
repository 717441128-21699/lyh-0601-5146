import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeScore } from './entities/judge-score.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Submission, SubmissionStatus } from '../submissions/entities/submission.entity';
import { RegistrationsService } from '../registrations/registrations.service';

export interface CreateJudgeScoreDto {
  submissionId: number;
  problemId: number;
  score: number;
  weight?: number;
  correctnessScore: number;
  styleScore: number;
  efficiencyScore: number;
  comment?: string;
}

@Injectable()
export class JudgesService {
  private readonly logger = new Logger(JudgesService.name);
  private readonly MIN_JUDGES_REQUIRED = 3;

  constructor(
    @InjectRepository(JudgeScore)
    private judgeScoresRepository: Repository<JudgeScore>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    private registrationsService: RegistrationsService,
  ) {}

  async create(dto: CreateJudgeScoreDto, judgeId: number): Promise<JudgeScore> {
    if (dto.score < 0 || dto.score > 100) {
      throw new BadRequestException('总分必须在0-100之间');
    }
    if (dto.correctnessScore < 0 || dto.correctnessScore > 100) {
      throw new BadRequestException('正确性评分必须在0-100之间');
    }
    if (dto.styleScore < 0 || dto.styleScore > 100) {
      throw new BadRequestException('代码风格评分必须在0-100之间');
    }
    if (dto.efficiencyScore < 0 || dto.efficiencyScore > 100) {
      throw new BadRequestException('效率评分必须在0-100之间');
    }

    const existing = await this.judgeScoresRepository.findOne({
      where: { submissionId: dto.submissionId, judgeId },
    });
    if (existing) {
      throw new BadRequestException('您已为此提交打分，如需修改请调用更新接口');
    }

    const submission = await this.submissionsRepository.findOne({
      where: { id: dto.submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`提交ID ${dto.submissionId} 不存在`);
    }

    const score = this.judgeScoresRepository.create({
      ...dto,
      weight: dto.weight || 100,
      judgeId,
    });
    const savedScore = await this.judgeScoresRepository.save(score);

    await this.tryFinalizeSubmissionScore(dto.submissionId);

    return savedScore;
  }

  private async tryFinalizeSubmissionScore(submissionId: number): Promise<void> {
    try {
      const allScores = await this.judgeScoresRepository.find({
        where: { submissionId },
      });

      if (allScores.length < this.MIN_JUDGES_REQUIRED) {
        this.logger.log(
          `提交 ${submissionId} 当前评委数: ${allScores.length}, 需要: ${this.MIN_JUDGES_REQUIRED}，暂不汇总`,
        );
        return;
      }

      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const s of allScores) {
        const weight = s.weight || 100;
        totalWeightedScore += s.score * weight;
        totalWeight += weight;
      }

      const finalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

      this.logger.log(
        `提交 ${submissionId} 打分完成，评委数: ${allScores.length}, 加权平均分: ${finalScore}`,
      );

      await this.submissionsRepository.update(submissionId, {
        score: finalScore,
        status: SubmissionStatus.ACCEPTED,
        isAccepted: true,
      });

      const submission = await this.submissionsRepository.findOne({
        where: { id: submissionId },
      });

      if (submission && submission.contestId) {
        const registration = await this.registrationsService.findByContestAndUser(
          submission.contestId,
          submission.userId,
        );
        if (registration) {
          const allUserSubmissions = await this.submissionsRepository.find({
            where: {
              contestId: submission.contestId,
              userId: submission.userId,
              isAccepted: true,
            },
          });

          const solvedProblemIds = new Set<number>();
          let totalScore = 0;
          let totalTime = 0;

          for (const s of allUserSubmissions) {
            if (!solvedProblemIds.has(s.problemId)) {
              solvedProblemIds.add(s.problemId);
              totalScore += s.score;
              totalTime += Math.floor((s.executionTime || 0) / 1000);
            }
          }

          await this.registrationsService.updateScore(
            registration.id,
            totalScore,
            solvedProblemIds.size,
            totalTime,
          );
        }
      }
    } catch (error) {
      this.logger.error(`汇总提交分数失败: ${error.message}`, error.stack);
    }
  }

  async getPendingSubmissions(paginationDto: PaginationDto) {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.submissionsRepository.createQueryBuilder('submission');
    queryBuilder.where('submission.status = :status', { status: SubmissionStatus.PENDING });
    queryBuilder.orWhere('submission.status = :status2', { status2: SubmissionStatus.JUDGING });

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy('submission.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async getSubmissionWithScores(submissionId: number): Promise<any> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException(`提交ID ${submissionId} 不存在`);
    }

    const scores = await this.judgeScoresRepository.find({
      where: { submissionId },
    });

    const avgResult = await this.getAverageScore(submissionId);

    return {
      submission,
      scores,
      averageScore: avgResult.average,
      judgeCount: avgResult.count,
      minJudgesRequired: this.MIN_JUDGES_REQUIRED,
      isFinalized: avgResult.count >= this.MIN_JUDGES_REQUIRED,
    };
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    submissionId?: number;
    judgeId?: number;
    problemId?: number;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.judgeScoresRepository.createQueryBuilder('score');

    if (filters?.submissionId) {
      queryBuilder.andWhere('score.submissionId = :submissionId', { submissionId: filters.submissionId });
    }
    if (filters?.judgeId) {
      queryBuilder.andWhere('score.judgeId = :judgeId', { judgeId: filters.judgeId });
    }
    if (filters?.problemId) {
      queryBuilder.andWhere('score.problemId = :problemId', { problemId: filters.problemId });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `score.${sortBy}` : 'score.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<JudgeScore> {
    const score = await this.judgeScoresRepository.findOne({ where: { id } });
    if (!score) {
      throw new NotFoundException(`评分记录ID ${id} 不存在`);
    }
    return score;
  }

  async findBySubmission(submissionId: number): Promise<JudgeScore[]> {
    return this.judgeScoresRepository.find({ where: { submissionId } });
  }

  async update(id: number, dto: Partial<CreateJudgeScoreDto>): Promise<JudgeScore> {
    const score = await this.findOne(id);
    Object.assign(score, dto);
    const updated = await this.judgeScoresRepository.save(score);
    await this.tryFinalizeSubmissionScore(score.submissionId);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const score = await this.findOne(id);
    await this.judgeScoresRepository.remove(score);
  }

  async review(id: number): Promise<JudgeScore> {
    const score = await this.findOne(id);
    score.isReviewed = true;
    return this.judgeScoresRepository.save(score);
  }

  async getAverageScore(submissionId: number): Promise<{ average: number; count: number; weightedAverage: number }> {
    const scores = await this.judgeScoresRepository.find({ where: { submissionId } });
    if (scores.length === 0) return { average: 0, count: 0, weightedAverage: 0 };
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    let weightedTotal = 0;
    let weightSum = 0;
    for (const s of scores) {
      const w = s.weight || 100;
      weightedTotal += s.score * w;
      weightSum += w;
    }
    return {
      average: total / scores.length,
      count: scores.length,
      weightedAverage: weightSum > 0 ? weightedTotal / weightSum : 0,
    };
  }
}
