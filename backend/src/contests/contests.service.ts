import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Contest, ContestStatus, ContestType } from './entities/contest.entity';
import { ContestGroup } from './entities/contest-group.entity';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest)
    private contestsRepository: Repository<Contest>,
    @InjectRepository(ContestGroup)
    private contestGroupsRepository: Repository<ContestGroup>,
    private dataSource: DataSource,
  ) {}

  async create(createContestDto: CreateContestDto, creatorId: number): Promise<Contest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contest = this.contestsRepository.create({
        ...createContestDto,
        creatorId,
        status: ContestStatus.DRAFT,
      });

      const savedContest = await queryRunner.manager.save(contest);

      if (createContestDto.groups && createContestDto.groups.length > 0) {
        const groups = createContestDto.groups.map((groupDto) =>
          this.contestGroupsRepository.create({
            ...groupDto,
            contestId: savedContest.id,
          }),
        );
        await queryRunner.manager.save(groups);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedContest.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.contestsRepository.findAndCount({
      skip,
      take: pageSize,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      relations: ['groups'],
      where: { isPublic: true },
    });

    return { items, total, page, pageSize };
  }

  async findAllAdmin(paginationDto: PaginationDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.contestsRepository.findAndCount({
      skip,
      take: pageSize,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      relations: ['groups'],
    });

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Contest> {
    const contest = await this.contestsRepository.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!contest) {
      throw new NotFoundException(`竞赛ID ${id} 不存在`);
    }
    return contest;
  }

  async update(id: number, updateContestDto: UpdateContestDto): Promise<Contest> {
    const contest = await this.findOne(id);

    const { groups: _groups, ...updateData } = updateContestDto as any;
    Object.assign(contest, updateData);

    await this.contestsRepository.save(contest);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const contest = await this.findOne(id);
    await this.contestsRepository.remove(contest);
  }

  async updateStatus(id: number, status: ContestStatus): Promise<Contest> {
    const contest = await this.findOne(id);
    contest.status = status;
    await this.contestsRepository.save(contest);
    return this.findOne(id);
  }

  async getOngoingContests() {
    const now = new Date();
    return this.contestsRepository.find({
      where: {
        status: ContestStatus.ONGOING,
        isPublic: true,
      },
      order: { startTime: 'ASC' },
      relations: ['groups'],
    });
  }

  async getUpcomingContests() {
    const now = new Date();
    return this.contestsRepository.find({
      where: {
        status: In([ContestStatus.REGISTRATION, ContestStatus.DRAFT]),
        isPublic: true,
        startTime: now,
      },
      order: { startTime: 'ASC' },
      relations: ['groups'],
    });
  }

  async getContestGroups(contestId: number): Promise<ContestGroup[]> {
    await this.findOne(contestId);
    return this.contestGroupsRepository.find({
      where: { contestId },
      order: { minRating: 'ASC' },
    });
  }

  async findSuitableGroup(contestId: number, userRating: number): Promise<ContestGroup | null> {
    const groups = await this.getContestGroups(contestId);

    for (const group of groups) {
      if (userRating >= group.minRating && userRating <= group.maxRating) {
        if (group.currentCount < group.maxCapacity) {
          return group;
        }
      }
    }

    for (const group of groups) {
      if (group.currentCount < group.maxCapacity) {
        return group;
      }
    }

    return null;
  }

  async incrementGroupCount(groupId: number): Promise<void> {
    await this.contestGroupsRepository.increment({ id: groupId }, 'currentCount', 1);
  }

  async decrementGroupCount(groupId: number): Promise<void> {
    await this.contestGroupsRepository.decrement({ id: groupId }, 'currentCount', 1);
  }
}
