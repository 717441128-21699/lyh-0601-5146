import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { Contest, ContestStatus } from '../contests/entities/contest.entity';
import { ContestGroup } from '../contests/entities/contest-group.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ContestsService } from '../contests/contests.service';
import { UsersService } from '../users/users.service';

function generateTicketNumber(contestId: number, userId: number): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CT-${contestId}-${userId}-${timestamp}-${random}`;
}

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
    private contestsService: ContestsService,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async create(contestId: number, userId: number): Promise<Registration> {
    const contest = await this.contestsService.findOne(contestId);
    const user = await this.usersService.findOne(userId);

    if (contest.status !== ContestStatus.REGISTRATION) {
      throw new BadRequestException('当前竞赛不处于报名阶段');
    }

    const now = new Date();
    if (now < contest.registrationStartTime) {
      throw new BadRequestException('报名尚未开始');
    }
    if (now > contest.registrationEndTime) {
      throw new BadRequestException('报名已结束');
    }

    const existingRegistration = await this.registrationsRepository.findOne({
      where: { contestId, userId },
    });
    if (existingRegistration) {
      throw new ConflictException('您已报名该竞赛');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let assignedGroup: ContestGroup | null = null;

      if (contest.autoAssignTrack) {
        assignedGroup = await this.contestsService.findSuitableGroup(contestId, user.rating);
        if (!assignedGroup) {
          throw new BadRequestException('所有赛道均已满员，报名失败');
        }
      } else {
        const groups = await this.contestsService.getContestGroups(contestId);
        if (groups.length > 0) {
          for (const group of groups) {
            if (group.currentCount < group.maxCapacity) {
              assignedGroup = group;
              break;
            }
          }
          if (!assignedGroup) {
            throw new BadRequestException('所有赛道均已满员，报名失败');
          }
        }
      }

      const registration = this.registrationsRepository.create({
        contestId,
        userId,
        groupId: assignedGroup ? assignedGroup.id : null,
        ticketNumber: generateTicketNumber(contestId, userId),
        status: RegistrationStatus.CONFIRMED,
        ratingAtRegistration: user.rating,
      });

      const savedRegistration = await queryRunner.manager.save(registration);

      if (assignedGroup) {
        await this.contestsService.incrementGroupCount(assignedGroup.id);
      }

      await this.usersService.incrementContestCount(userId);

      await queryRunner.commitTransaction();
      return this.findOne(savedRegistration.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    contestId?: number;
    userId?: number;
    status?: RegistrationStatus;
    groupId?: number;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.registrationsRepository.createQueryBuilder('registration');

    if (filters?.contestId) {
      queryBuilder.andWhere('registration.contestId = :contestId', { contestId: filters.contestId });
    }
    if (filters?.userId) {
      queryBuilder.andWhere('registration.userId = :userId', { userId: filters.userId });
    }
    if (filters?.status) {
      queryBuilder.andWhere('registration.status = :status', { status: filters.status });
    }
    if (filters?.groupId) {
      queryBuilder.andWhere('registration.groupId = :groupId', { groupId: filters.groupId });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `registration.${sortBy}` : 'registration.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({ where: { id } });
    if (!registration) {
      throw new NotFoundException(`报名记录ID ${id} 不存在`);
    }
    return registration;
  }

  async findByContestAndUser(contestId: number, userId: number): Promise<Registration | null> {
    return this.registrationsRepository.findOne({ where: { contestId, userId } });
  }

  async findByUser(userId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { userId });
  }

  async findByContest(contestId: number, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, { contestId });
  }

  async cancel(id: number, userId: number): Promise<Registration> {
    const registration = await this.findOne(id);

    if (registration.userId !== userId) {
      throw new BadRequestException('无权取消他人报名');
    }

    if (registration.status !== RegistrationStatus.CONFIRMED && registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('当前状态无法取消报名');
    }

    const contest = await this.contestsService.findOne(registration.contestId);
    if (contest.status === ContestStatus.ONGOING || contest.status === ContestStatus.ENDED) {
      throw new BadRequestException('竞赛已开始或已结束，无法取消报名');
    }

    registration.status = RegistrationStatus.CANCELLED;
    await this.registrationsRepository.save(registration);

    if (registration.groupId) {
      await this.contestsService.decrementGroupCount(registration.groupId);
    }

    return this.findOne(id);
  }

  async updateScore(id: number, score: number, solvedCount: number, totalTime: number): Promise<Registration> {
    const registration = await this.findOne(id);
    registration.finalScore = score;
    registration.solvedCount = solvedCount;
    registration.totalTime = totalTime;
    return this.registrationsRepository.save(registration);
  }

  async updateRank(id: number, rank: number, ratingChange: number): Promise<Registration> {
    const registration = await this.findOne(id);
    registration.finalRank = rank;
    registration.ratingChange = ratingChange;
    return this.registrationsRepository.save(registration);
  }

  async getContestRankings(contestId: number, paginationDto: PaginationDto) {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.registrationsRepository.findAndCount({
      where: { contestId, status: RegistrationStatus.CONFIRMED },
      skip,
      take: pageSize,
      order: {
        finalScore: 'DESC',
        solvedCount: 'DESC',
        totalTime: 'ASC',
      },
    });

    return { items, total, page, pageSize };
  }

  async getGroupRankings(contestId: number, groupId: number, paginationDto: PaginationDto) {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.registrationsRepository.findAndCount({
      where: { contestId, groupId, status: RegistrationStatus.CONFIRMED },
      skip,
      take: pageSize,
      order: {
        finalScore: 'DESC',
        solvedCount: 'DESC',
        totalTime: 'ASC',
      },
    });

    return { items, total, page, pageSize };
  }

  async isUserRegistered(contestId: number, userId: number): Promise<boolean> {
    const registration = await this.findByContestAndUser(contestId, userId);
    return registration !== null && registration.status !== RegistrationStatus.CANCELLED;
  }

  async getRegistrationStats(contestId: number) {
    const total = await this.registrationsRepository.count({ where: { contestId } });
    const confirmed = await this.registrationsRepository.count({ where: { contestId, status: RegistrationStatus.CONFIRMED } });
    const cancelled = await this.registrationsRepository.count({ where: { contestId, status: RegistrationStatus.CANCELLED } });
    const pending = await this.registrationsRepository.count({ where: { contestId, status: RegistrationStatus.PENDING } });

    return { total, confirmed, cancelled, pending };
  }
}
