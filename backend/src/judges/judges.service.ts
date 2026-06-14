import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JudgeScore } from './entities/judge-score.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

export interface CreateJudgeScoreDto {
  submissionId: number;
  problemId: number;
  score: number;
  correctnessScore: number;
  styleScore: number;
  efficiencyScore: number;
  comment?: string;
}

@Injectable()
export class JudgesService {
  constructor(
    @InjectRepository(JudgeScore)
    private judgeScoresRepository: Repository<JudgeScore>,
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

    const score = this.judgeScoresRepository.create({
      ...dto,
      judgeId,
    });
    return this.judgeScoresRepository.save(score);
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
    return this.judgeScoresRepository.save(score);
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

  async getAverageScore(submissionId: number): Promise<{ average: number; count: number }> {
    const scores = await this.judgeScoresRepository.find({ where: { submissionId } });
    if (scores.length === 0) return { average: 0, count: 0 };
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return { average: total / scores.length, count: scores.length };
  }
}
