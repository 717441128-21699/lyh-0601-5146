import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum ProblemStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('problems')
export class Problem {
  @ApiProperty({ description: '题目ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '题目标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '题目描述' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: '输入描述' })
  @Column({ type: 'text', nullable: true })
  inputDescription: string;

  @ApiProperty({ description: '输出描述' })
  @Column({ type: 'text', nullable: true })
  outputDescription: string;

  @ApiProperty({ description: '样例输入' })
  @Column({ type: 'text', nullable: true })
  sampleInput: string;

  @ApiProperty({ description: '样例输出' })
  @Column({ type: 'text', nullable: true })
  sampleOutput: string;

  @ApiProperty({ description: '提示/Hint' })
  @Column({ type: 'text', nullable: true })
  hint: string;

  @ApiProperty({ description: '难度', enum: ProblemDifficulty })
  @Column({
    type: 'enum',
    enum: ProblemDifficulty,
    default: ProblemDifficulty.MEDIUM,
  })
  difficulty: ProblemDifficulty;

  @ApiProperty({ description: '状态', enum: ProblemStatus })
  @Column({
    type: 'enum',
    enum: ProblemStatus,
    default: ProblemStatus.DRAFT,
  })
  status: ProblemStatus;

  @ApiProperty({ description: '时间限制（毫秒）' })
  @Column({ type: 'int', default: 1000 })
  timeLimit: number;

  @ApiProperty({ description: '内存限制（KB）' })
  @Column({ type: 'int', default: 65536 })
  memoryLimit: number;

  @ApiProperty({ description: '分值' })
  @Column({ type: 'int', default: 100 })
  score: number;

  @ApiProperty({ description: '通过次数' })
  @Column({ type: 'int', default: 0 })
  acceptedCount: number;

  @ApiProperty({ description: '提交次数' })
  @Column({ type: 'int', default: 0 })
  submissionCount: number;

  @ApiProperty({ description: '关联竞赛ID（可选）' })
  @Column({ type: 'int', nullable: true })
  contestId: number;

  @ApiProperty({ description: '标签/分类，逗号分隔' })
  @Column({ length: 500, nullable: true })
  tags: string;

  @ApiProperty({ description: '创建者ID' })
  @Column()
  creatorId: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
