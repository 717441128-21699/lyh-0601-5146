import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AntiCheatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AntiCheatReviewStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
}

@Entity('anti_cheat_records')
export class AntiCheatRecord {
  @ApiProperty({ description: '记录ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '提交ID' })
  @Column({ name: 'submission_id' })
  @Index()
  submissionId: number;

  @ApiProperty({ description: '对比的提交ID' })
  @Column({ name: 'compared_submission_id', nullable: true })
  comparedSubmissionId: number;

  @ApiProperty({ description: '题目ID' })
  @Column({ name: 'problem_id' })
  @Index()
  problemId: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ApiProperty({ description: '对比的用户ID' })
  @Column({ name: 'compared_user_id', nullable: true })
  comparedUserId: number;

  @ApiProperty({ description: '代码相似度（0-100）' })
  @Column({ name: 'similarity', type: 'float', default: 0 })
  similarity: number;

  @ApiProperty({ description: '检测类型：hash_match / structure / token' })
  @Column({ name: 'detection_type', length: 50 })
  detectionType: string;

  @ApiProperty({ description: '严重程度', enum: AntiCheatSeverity })
  @Column({
    name: 'severity',
    type: 'enum',
    enum: AntiCheatSeverity,
    default: AntiCheatSeverity.LOW,
  })
  severity: AntiCheatSeverity;

  @ApiProperty({ description: '代码hash值' })
  @Column({ name: 'code_hash', length: 64, nullable: true })
  codeHash: string;

  @ApiProperty({ description: '检测详情（JSON）' })
  @Column({ name: 'details', type: 'json', nullable: true })
  details: any;

  @ApiProperty({ description: '复核状态', enum: AntiCheatReviewStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: AntiCheatReviewStatus,
    default: AntiCheatReviewStatus.PENDING,
  })
  status: AntiCheatReviewStatus;

  @ApiProperty({ description: '是否已处理' })
  @Column({ name: 'is_handled', type: 'boolean', default: false })
  isHandled: boolean;

  @ApiProperty({ description: '处理备注/复核备注' })
  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote: string;

  @ApiProperty({ description: '复核管理员ID' })
  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedBy: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
