import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('judge_scores')
@Index(['submissionId', 'judgeId'], { unique: true })
export class JudgeScore {
  @ApiProperty({ description: '打分ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '提交ID' })
  @Column()
  @Index()
  submissionId: number;

  @ApiProperty({ description: '评委用户ID' })
  @Column()
  @Index()
  judgeId: number;

  @ApiProperty({ description: '题目ID' })
  @Column()
  problemId: number;

  @ApiProperty({ description: '得分' })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '代码正确性评分（0-100）' })
  @Column({ type: 'int', default: 0 })
  correctnessScore: number;

  @ApiProperty({ description: '代码风格评分（0-100）' })
  @Column({ type: 'int', default: 0 })
  styleScore: number;

  @ApiProperty({ description: '算法效率评分（0-100）' })
  @Column({ type: 'int', default: 0 })
  efficiencyScore: number;

  @ApiProperty({ description: '评语' })
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ApiProperty({ description: '是否已审核' })
  @Column({ type: 'boolean', default: false })
  isReviewed: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
