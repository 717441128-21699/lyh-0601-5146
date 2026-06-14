import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AntiCheatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('anti_cheat_records')
export class AntiCheatRecord {
  @ApiProperty({ description: '记录ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '提交ID' })
  @Column()
  @Index()
  submissionId: number;

  @ApiProperty({ description: '对比的提交ID' })
  @Column({ nullable: true })
  comparedSubmissionId: number;

  @ApiProperty({ description: '题目ID' })
  @Column()
  @Index()
  problemId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '对比的用户ID' })
  @Column({ nullable: true })
  comparedUserId: number;

  @ApiProperty({ description: '代码相似度（0-100）' })
  @Column({ type: 'float', default: 0 })
  similarity: number;

  @ApiProperty({ description: '检测类型：hash_match / structure / token' })
  @Column({ length: 50 })
  detectionType: string;

  @ApiProperty({ description: '严重程度', enum: AntiCheatSeverity })
  @Column({
    type: 'enum',
    enum: AntiCheatSeverity,
    default: AntiCheatSeverity.LOW,
  })
  severity: AntiCheatSeverity;

  @ApiProperty({ description: '代码hash值' })
  @Column({ length: 64, nullable: true })
  codeHash: string;

  @ApiProperty({ description: '检测详情（JSON）' })
  @Column({ type: 'json', nullable: true })
  details: any;

  @ApiProperty({ description: '是否已处理' })
  @Column({ type: 'boolean', default: false })
  isHandled: boolean;

  @ApiProperty({ description: '处理备注' })
  @Column({ type: 'text', nullable: true })
  handlingNote: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
