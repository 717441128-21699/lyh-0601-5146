import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
  @Column()
  @Index()
  contestId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '分配的组别ID' })
  @Column({ nullable: true })
  groupId: number;

  @ApiProperty({ description: '参赛凭证（报名号）' })
  @Column({ unique: true, length: 50 })
  ticketNumber: string;

  @ApiProperty({ description: '报名状态', enum: RegistrationStatus })
  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @ApiProperty({ description: '报名时用户rating' })
  @Column({ type: 'int' })
  ratingAtRegistration: number;

  @ApiProperty({ description: '最终得分' })
  @Column({ type: 'int', default: 0 })
  finalScore: number;

  @ApiProperty({ description: '最终排名' })
  @Column({ type: 'int', nullable: true })
  finalRank: number;

  @ApiProperty({ description: 'rating变化值' })
  @Column({ type: 'int', default: 0 })
  ratingChange: number;

  @ApiProperty({ description: '完成题目数量' })
  @Column({ type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '总用时（秒）' })
  @Column({ type: 'int', default: 0 })
  totalTime: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
