import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SubmissionStatus {
  PENDING = 'pending',
  JUDGING = 'judging',
  ACCEPTED = 'accepted',
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  COMPILATION_ERROR = 'compilation_error',
  RUNTIME_ERROR = 'runtime_error',
  SYSTEM_ERROR = 'system_error',
}

export enum ProgrammingLanguage {
  CPP = 'cpp',
  JAVA = 'java',
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
}

@Entity('submissions')
export class Submission {
  @ApiProperty({ description: '提交ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '题目ID' })
  @Column({ name: 'problem_id' })
  @Index()
  problemId: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ApiProperty({ description: '竞赛ID（可选）' })
  @Column({ name: 'contest_id', type: 'int', nullable: true })
  @Index()
  contestId: number;

  @ApiProperty({ description: '报名ID（可选）' })
  @Column({ name: 'registration_id', type: 'int', nullable: true })
  registrationId: number;

  @ApiProperty({ description: '编程语言', enum: ProgrammingLanguage })
  @Column({
    name: 'language',
    type: 'enum',
    enum: ProgrammingLanguage,
  })
  language: ProgrammingLanguage;

  @ApiProperty({ description: '源代码' })
  @Column({ name: 'code', type: 'mediumtext' })
  code: string;

  @ApiProperty({ description: '提交状态', enum: SubmissionStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @ApiProperty({ description: '得分' })
  @Column({ name: 'score', type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '运行时间（毫秒）' })
  @Column({ name: 'execution_time', type: 'int', default: 0 })
  executionTime: number;

  @ApiProperty({ description: '内存使用（KB）' })
  @Column({ name: 'execution_memory', type: 'int', default: 0 })
  executionMemory: number;

  @ApiProperty({ description: '代码长度（字节）' })
  @Column({ name: 'code_length', type: 'int', default: 0 })
  codeLength: number;

  @ApiProperty({ description: '编译/运行错误信息' })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: '评测详情（JSON格式，各测试点结果）' })
  @Column({ name: 'judge_details', type: 'json', nullable: true })
  judgeDetails: any;

  @ApiProperty({ description: '代码hash值（用于反作弊）' })
  @Column({ name: 'code_hash', length: 64, nullable: true })
  codeHash: string;

  @ApiProperty({ description: '是否通过' })
  @Column({ name: 'is_accepted', type: 'boolean', default: false })
  isAccepted: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
