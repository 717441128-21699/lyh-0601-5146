import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('judge_scores')
@Index(['submissionId', 'judgeId'], { unique: true })
export class JudgeScore {
  @ApiProperty({ description: '打分ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '提交ID' })
  @Column({ name: 'submission_id' })
  @Index()
  submissionId: number;

  @ApiProperty({ description: '评委用户ID' })
  @Column({ name: 'judge_id' })
  @Index()
  judgeId: number;

  @ApiProperty({ description: '题目ID' })
  @Column({ name: 'problem_id' })
  problemId: number;

  @ApiProperty({ description: '得分' })
  @Column({ name: 'score', type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '权重（0-100，默认100）' })
  @Column({ name: 'weight', type: 'int', default: 100 })
  weight: number;

  @ApiProperty({ description: '代码正确性评分（0-100）' })
  @Column({ name: 'correctness_score', type: 'int', default: 0 })
  correctnessScore: number;

  @ApiProperty({ description: '代码风格评分（0-100）' })
  @Column({ name: 'style_score', type: 'int', default: 0 })
  styleScore: number;

  @ApiProperty({ description: '算法效率评分（0-100）' })
  @Column({ name: 'efficiency_score', type: 'int', default: 0 })
  efficiencyScore: number;

  @ApiProperty({ description: '评语' })
  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string;

  @ApiProperty({ description: '是否已审核' })
  @Column({ name: 'is_reviewed', type: 'boolean', default: false })
  isReviewed: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
