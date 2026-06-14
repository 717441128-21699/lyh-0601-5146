import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  SYSTEM = 'system',
  CONTEST = 'contest',
  SUBMISSION = 'submission',
  MESSAGE = 'message',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: '通知ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '接收用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '发送者用户ID（系统通知为null）' })
  @Column({ nullable: true })
  senderId: number;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @ApiProperty({ description: '通知标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '通知内容' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '关联ID（如竞赛ID、提交ID）' })
  @Column({ type: 'int', nullable: true })
  relatedId: number;

  @ApiProperty({ description: '跳转链接' })
  @Column({ length: 500, nullable: true })
  link: string;

  @ApiProperty({ description: '是否已读' })
  @Column({ type: 'boolean', default: false })
  @Index()
  isRead: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
