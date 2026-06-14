import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem, ProblemDifficulty, ProblemStatus } from './entities/problem.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

export interface CreateProblemDto {
  title: string;
  description: string;
  inputDescription?: string;
  outputDescription?: string;
  sampleInput?: string;
  sampleOutput?: string;
  hint?: string;
  difficulty?: ProblemDifficulty;
  timeLimit?: number;
  memoryLimit?: number;
  score?: number;
  contestId?: number;
  tags?: string;
}

export interface UpdateProblemDto {
  title?: string;
  description?: string;
  inputDescription?: string;
  outputDescription?: string;
  sampleInput?: string;
  sampleOutput?: string;
  hint?: string;
  difficulty?: ProblemDifficulty;
  status?: ProblemStatus;
  timeLimit?: number;
  memoryLimit?: number;
  score?: number;
  contestId?: number;
  tags?: string;
}

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
  ) {}

  async create(createProblemDto: CreateProblemDto, creatorId: number): Promise<Problem> {
    const problem = this.problemsRepository.create({
      ...createProblemDto,
      creatorId,
      status: ProblemStatus.DRAFT,
    });
    return this.problemsRepository.save(problem);
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    difficulty?: ProblemDifficulty;
    contestId?: number;
    keyword?: string;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.problemsRepository.createQueryBuilder('problem');

    queryBuilder.where('problem.status = :status', { status: ProblemStatus.PUBLISHED });

    if (filters?.difficulty) {
      queryBuilder.andWhere('problem.difficulty = :difficulty', { difficulty: filters.difficulty });
    }

    if (filters?.contestId) {
      queryBuilder.andWhere('problem.contestId = :contestId', { contestId: filters.contestId });
    }

    if (filters?.keyword) {
      queryBuilder.andWhere('problem.title LIKE :keyword OR problem.tags LIKE :keyword', {
        keyword: `%${filters.keyword}%`,
      });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `problem.${sortBy}` : 'problem.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findAllAdmin(paginationDto: PaginationDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.problemsRepository.findAndCount({
      skip,
      take: pageSize,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
    });

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Problem> {
    const problem = await this.problemsRepository.findOne({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`题目ID ${id} 不存在`);
    }
    return problem;
  }

  async findByContestId(contestId: number): Promise<Problem[]> {
    return this.problemsRepository.find({
      where: { contestId, status: ProblemStatus.PUBLISHED },
      order: { id: 'ASC' },
    });
  }

  async update(id: number, updateProblemDto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.findOne(id);
    Object.assign(problem, updateProblemDto);
    return this.problemsRepository.save(problem);
  }

  async remove(id: number): Promise<void> {
    const problem = await this.findOne(id);
    await this.problemsRepository.remove(problem);
  }

  async publish(id: number): Promise<Problem> {
    const problem = await this.findOne(id);
    problem.status = ProblemStatus.PUBLISHED;
    return this.problemsRepository.save(problem);
  }

  async archive(id: number): Promise<Problem> {
    const problem = await this.findOne(id);
    problem.status = ProblemStatus.ARCHIVED;
    return this.problemsRepository.save(problem);
  }

  async incrementAcceptedCount(id: number): Promise<void> {
    await this.problemsRepository.increment({ id }, 'acceptedCount', 1);
  }

  async incrementSubmissionCount(id: number): Promise<void> {
    await this.problemsRepository.increment({ id }, 'submissionCount', 1);
  }

  async getAcceptanceRate(id: number): Promise<number> {
    const problem = await this.findOne(id);
    if (problem.submissionCount === 0) return 0;
    return Math.round((problem.acceptedCount / problem.submissionCount) * 100);
  }
}
