import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContestGroup } from '../../contests/entities/contest-group.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity('registrations')
@Unique(['contestId', 'userId'])
export class Registration {
  @ApiProperty({ description: '报名ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛ID' })
  @Column({ name: 'contest_id' })
  @Index()
  contestId: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ApiProperty({ description: '分配的组别ID' })
  @Column({ name: 'group_id', nullable: true })
  groupId: number;

  @ApiProperty({ description: '参赛凭证（报名号）' })
  @Column({ name: 'ticket_number', unique: true, length: 50 })
  ticketNumber: string;

  @ApiProperty({ description: '报名状态', enum: RegistrationStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @ApiProperty({ description: '报名时用户rating' })
  @Column({ name: 'rating_at_registration', type: 'int' })
  ratingAtRegistration: number;

  @ApiProperty({ description: '最终得分' })
  @Column({ name: 'final_score', type: 'int', default: 0 })
  finalScore: number;

  @ApiProperty({ description: '最终排名' })
  @Column({ name: 'final_rank', type: 'int', nullable: true })
  finalRank: number;

  @ApiProperty({ description: 'rating变化值' })
  @Column({ name: 'rating_change', type: 'int', default: 0 })
  ratingChange: number;

  @ApiProperty({ description: '完成题目数量' })
  @Column({ name: 'solved_count', type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '总用时（秒）' })
  @Column({ name: 'total_time', type: 'int', default: 0 })
  totalTime: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ContestGroup, { nullable: true, eager: false })
  @JoinColumn({ name: 'group_id' })
  group: ContestGroup;
}
