import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './entities/ranking.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Ranking)
    private rankingsRepository: Repository<Ranking>,
  ) {}

  async create(data: Partial<Ranking>): Promise<Ranking> {
    const ranking = this.rankingsRepository.create(data);
    return this.rankingsRepository.save(ranking);
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    contestId?: number;
    groupId?: number;
    userId?: number;
  }) {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.rankingsRepository.createQueryBuilder('ranking');

    if (filters?.contestId) {
      queryBuilder.andWhere('ranking.contestId = :contestId', { contestId: filters.contestId });
    }
    if (filters?.groupId) {
      queryBuilder.andWhere('ranking.groupId = :groupId', { groupId: filters.groupId });
    }
    if (filters?.userId) {
      queryBuilder.andWhere('ranking.userId = :userId', { userId: filters.userId });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy('ranking.rank', 'ASC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Ranking> {
    const ranking = await this.rankingsRepository.findOne({ where: { id } });
    if (!ranking) {
      throw new NotFoundException(`排名记录ID ${id} 不存在`);
    }
    return ranking;
  }

  async getContestRankings(contestId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { contestId });
  }

  async getGroupRankings(contestId: number, groupId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { contestId, groupId });
  }

  async getUserRankings(userId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { userId });
  }

  async update(id: number, data: Partial<Ranking>): Promise<Ranking> {
    const ranking = await this.findOne(id);
    Object.assign(ranking, data);
    return this.rankingsRepository.save(ranking);
  }

  async calculateRatings(contestId: number, participants: Array<{ userId: number; rating: number; rank: number }>) {
    const results: Array<{ userId: number; ratingChange: number; newRating: number }> = [];
    const K_FACTOR = 32;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      let expectedScore = 0;

      for (let j = 0; j < participants.length; j++) {
        if (i !== j) {
          expectedScore += 1 / (1 + Math.pow(10, (participants[j].rating - p.rating) / 400));
        }
      }

      const actualScore = participants.length - p.rank;
      const ratingChange = Math.round(K_FACTOR * (actualScore - expectedScore));

      results.push({
        userId: p.userId,
        ratingChange,
        newRating: p.rating + ratingChange,
      });
    }

    return results;
  }
}
