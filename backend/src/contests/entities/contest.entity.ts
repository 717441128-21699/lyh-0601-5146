import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContestGroup } from './contest-group.entity';

export enum ContestStatus {
  DRAFT = 'draft',
  REGISTRATION = 'registration',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum ContestType {
  RATED = 'rated',
  UNRATED = 'unrated',
  PRACTICE = 'practice',
}

@Entity('contests')
export class Contest {
  @ApiProperty({ description: '竞赛ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '竞赛简介' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '竞赛状态', enum: ContestStatus })
  @Column({
    type: 'enum',
    enum: ContestStatus,
    default: ContestStatus.DRAFT,
  })
  status: ContestStatus;

  @ApiProperty({ description: '竞赛类型', enum: ContestType })
  @Column({
    type: 'enum',
    enum: ContestType,
    default: ContestType.RATED,
  })
  type: ContestType;

  @ApiProperty({ description: '封面图片' })
  @Column({ length: 255, nullable: true })
  coverImage: string;

  @ApiProperty({ description: '报名开始时间' })
  @Column({ type: 'datetime' })
  registrationStartTime: Date;

  @ApiProperty({ description: '报名结束时间' })
  @Column({ type: 'datetime' })
  registrationEndTime: Date;

  @ApiProperty({ description: '竞赛开始时间' })
  @Column({ type: 'datetime' })
  startTime: Date;

  @ApiProperty({ description: '竞赛结束时间' })
  @Column({ type: 'datetime' })
  endTime: Date;

  @ApiProperty({ description: '总题目数' })
  @Column({ type: 'int', default: 0 })
  problemCount: number;

  @ApiProperty({ description: '总分值' })
  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @ApiProperty({ description: '是否启用自动分配赛道' })
  @Column({ type: 'boolean', default: true })
  autoAssignTrack: boolean;

  @ApiProperty({ description: '创建者ID' })
  @Column()
  creatorId: number;

  @ApiProperty({ description: '是否公开' })
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @ApiProperty({ description: '访问密码（非公开时使用）' })
  @Column({ length: 50, nullable: true })
  accessPassword: string;

  @ApiProperty({ description: '规则说明' })
  @Column({ type: 'text', nullable: true })
  rules: string;

  @ApiProperty({ description: '奖励说明' })
  @Column({ type: 'text', nullable: true })
  prizes: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ContestGroup, (group) => group.contest, { cascade: true })
  groups: ContestGroup[];
}
