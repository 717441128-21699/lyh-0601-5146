import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContestGroup } from './contest-group.entity';

export enum ContestStatus {
  DRAFT = 'draft',
  REGISTERING = 'registering',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum ContestType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
}

export enum ContestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
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
    name: 'status',
    type: 'enum',
    enum: ContestStatus,
    default: ContestStatus.DRAFT,
  })
  status: ContestStatus;

  @ApiProperty({ description: '竞赛类型', enum: ContestType })
  @Column({
    name: 'type',
    type: 'enum',
    enum: ContestType,
    default: ContestType.INDIVIDUAL,
  })
  type: ContestType;

  @ApiProperty({ description: '竞赛难度', enum: ContestDifficulty })
  @Column({
    name: 'difficulty',
    type: 'enum',
    enum: ContestDifficulty,
    default: ContestDifficulty.MEDIUM,
  })
  difficulty: ContestDifficulty;

  @ApiProperty({ description: '最大参赛人数' })
  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants: number;

  @ApiProperty({ description: '反作弊检测阈值' })
  @Column({ name: 'anti_cheat_threshold', type: 'decimal', precision: 5, scale: 2, default: 0.85 })
  antiCheatThreshold: number;

  @ApiProperty({ description: '检查点数量' })
  @Column({ name: 'check_point_count', type: 'int', default: 3 })
  checkPointCount: number;

  @ApiProperty({ description: '主办方' })
  @Column({ name: 'organizer', length: 100 })
  organizer: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({ name: 'created_by' })
  creatorId: number;

  @ApiProperty({ description: '封面图片' })
  @Column({ name: 'cover_image', length: 255, nullable: true })
  coverImage: string;

  @ApiProperty({ description: '报名开始时间' })
  @Column({ name: 'registration_start_time', type: 'datetime' })
  registrationStartTime: Date;

  @ApiProperty({ description: '报名结束时间' })
  @Column({ name: 'registration_end_time', type: 'datetime' })
  registrationEndTime: Date;

  @ApiProperty({ description: '竞赛开始时间' })
  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @ApiProperty({ description: '竞赛结束时间' })
  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @ApiProperty({ description: '规则说明' })
  @Column({ type: 'text', nullable: true })
  rules: string;

  @ApiProperty({ description: '奖励说明' })
  @Column({ type: 'text', nullable: true })
  prizes: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ContestGroup, (group) => group.contest, { cascade: true })
  groups: ContestGroup[];

  isRegistered?: boolean;
  registrationInfo?: any;
}
