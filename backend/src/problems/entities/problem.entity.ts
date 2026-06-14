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

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

@Entity('problems')
export class Problem {
  @ApiProperty({ description: '题目ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '题目标题' })
  @Column({ name: 'title', length: 200 })
  title: string;

  @ApiProperty({ description: '题目描述' })
  @Column({ name: 'description', type: 'text' })
  description: string;

  @ApiProperty({ description: '输入描述' })
  @Column({ name: 'input_description', type: 'text', nullable: true })
  inputDescription: string;

  @ApiProperty({ description: '输出描述' })
  @Column({ name: 'output_description', type: 'text', nullable: true })
  outputDescription: string;

  @ApiProperty({ description: '样例输入' })
  @Column({ name: 'sample_input', type: 'text', nullable: true })
  sampleInput: string;

  @ApiProperty({ description: '样例输出' })
  @Column({ name: 'sample_output', type: 'text', nullable: true })
  sampleOutput: string;

  @ApiProperty({ description: '测试用例（JSON格式）' })
  @Column({ name: 'test_cases', type: 'json', nullable: true })
  testCases: TestCase[];

  @ApiProperty({ description: '提示/Hint' })
  @Column({ name: 'hint', type: 'text', nullable: true })
  hint: string;

  @ApiProperty({ description: '难度', enum: ProblemDifficulty })
  @Column({
    name: 'difficulty',
    type: 'enum',
    enum: ProblemDifficulty,
    default: ProblemDifficulty.MEDIUM,
  })
  difficulty: ProblemDifficulty;

  @ApiProperty({ description: '状态', enum: ProblemStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ProblemStatus,
    default: ProblemStatus.DRAFT,
  })
  status: ProblemStatus;

  @ApiProperty({ description: '时间限制（毫秒）' })
  @Column({ name: 'time_limit', type: 'int', default: 1000 })
  timeLimit: number;

  @ApiProperty({ description: '内存限制（KB）' })
  @Column({ name: 'memory_limit', type: 'int', default: 65536 })
  memoryLimit: number;

  @ApiProperty({ description: '分值' })
  @Column({ name: 'score', type: 'int', default: 100 })
  score: number;

  @ApiProperty({ description: '通过次数' })
  @Column({ name: 'accepted_count', type: 'int', default: 0 })
  acceptedCount: number;

  @ApiProperty({ description: '提交次数' })
  @Column({ name: 'submission_count', type: 'int', default: 0 })
  submissionCount: number;

  @ApiProperty({ description: '关联竞赛ID（可选）' })
  @Column({ name: 'contest_id', type: 'int', nullable: true })
  contestId: number;

  @ApiProperty({ description: '标签/分类，逗号分隔' })
  @Column({ name: 'tags', length: 500, nullable: true })
  tags: string;

  @ApiProperty({ description: '创建者ID' })
  @Column({ name: 'created_by' })
  creatorId: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
