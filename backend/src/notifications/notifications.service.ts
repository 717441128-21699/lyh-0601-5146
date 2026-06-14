import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

export interface CreateNotificationDto {
  userId: number;
  senderId?: number;
  type?: NotificationType;
  title: string;
  content: string;
  relatedId?: number;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(dto);
    return this.notificationsRepository.save(notification);
  }

  async createBatch(dtos: CreateNotificationDto[]): Promise<Notification[]> {
    const notifications = this.notificationsRepository.create(dtos);
    return this.notificationsRepository.save(notifications);
  }

  async findAll(paginationDto: PaginationDto, filters?: {
    userId?: number;
    type?: NotificationType;
    isRead?: boolean;
  }) {
    const { page, pageSize, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.notificationsRepository.createQueryBuilder('notification');

    if (filters?.userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId: filters.userId });
    }
    if (filters?.type) {
      queryBuilder.andWhere('notification.type = :type', { type: filters.type });
    }
    if (filters?.isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
    }

    queryBuilder.skip(skip).take(pageSize);
    queryBuilder.orderBy(sortBy ? `notification.${sortBy}` : 'notification.createdAt', sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total, page, pageSize };
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`通知ID ${id} 不存在`);
    }
    return notification;
  }

  async findByUser(userId: number, paginationDto: PaginationDto, filters?: {
    type?: NotificationType;
    isRead?: boolean;
  }) {
    return this.findAll(paginationDto, { userId, ...filters });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return result.affected || 0;
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async removeBatch(ids: number[]): Promise<void> {
    await this.notificationsRepository.delete({ id: In(ids) });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({ where: { userId, isRead: false } });
  }

  async notifyContestStart(contestId: number, userIds: number[], contestTitle: string): Promise<void> {
    const dtos: CreateNotificationDto[] = userIds.map((userId) => ({
      userId,
      type: NotificationType.CONTEST,
      title: `竞赛开始：${contestTitle}`,
      content: `您报名的竞赛「${contestTitle}」已开始，请及时参加！`,
      relatedId: contestId,
      link: `/contests/${contestId}`,
    }));
    await this.createBatch(dtos);
  }

  async notifySubmissionResult(userId: number, submissionId: number, result: string, problemTitle: string): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.SUBMISSION,
      title: `提交结果：${result}`,
      content: `您对题目「${problemTitle}」的提交结果为：${result}`,
      relatedId: submissionId,
      link: `/submissions/${submissionId}`,
    });
  }
}
