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
  @Column()
  @Index()
  problemId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '竞赛ID（可选）' })
  @Column({ type: 'int', nullable: true })
  @Index()
  contestId: number;

  @ApiProperty({ description: '报名ID（可选）' })
  @Column({ type: 'int', nullable: true })
  registrationId: number;

  @ApiProperty({ description: '编程语言', enum: ProgrammingLanguage })
  @Column({
    type: 'enum',
    enum: ProgrammingLanguage,
  })
  language: ProgrammingLanguage;

  @ApiProperty({ description: '源代码' })
  @Column({ type: 'mediumtext' })
  code: string;

  @ApiProperty({ description: '提交状态', enum: SubmissionStatus })
  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @ApiProperty({ description: '得分' })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '运行时间（毫秒）' })
  @Column({ type: 'int', default: 0 })
  runTime: number;

  @ApiProperty({ description: '内存使用（KB）' })
  @Column({ type: 'int', default: 0 })
  memoryUsage: number;

  @ApiProperty({ description: '代码长度（字节）' })
  @Column({ type: 'int', default: 0 })
  codeLength: number;

  @ApiProperty({ description: '编译/运行错误信息' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: '评测详情（JSON格式，各测试点结果）' })
  @Column({ type: 'json', nullable: true })
  judgeDetails: any;

  @ApiProperty({ description: '代码hash值（用于反作弊）' })
  @Column({ length: 64, nullable: true })
  codeHash: string;

  @ApiProperty({ description: '是否通过' })
  @Column({ type: 'boolean', default: false })
  isAccepted: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
