import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  PARTICIPANT = 'participant',
  ADMIN = 'admin',
  JUDGE = 'judge',
}

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ name: 'username', unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ name: 'email', unique: true, length: 100 })
  email: string;

  @Column({ name: 'password', length: 255 })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ name: 'nickname', length: 50, nullable: true })
  nickname: string;

  @ApiProperty({ description: '头像' })
  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar: string;

  @ApiProperty({ description: '用户角色', enum: UserRole })
  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARTICIPANT,
  })
  role: UserRole;

  @ApiProperty({ description: '用户rating积分' })
  @Column({ name: 'rating', type: 'int', default: 1500 })
  rating: number;

  @ApiProperty({ description: '参赛次数' })
  @Column({ name: 'contest_count', type: 'int', default: 0 })
  contestCount: number;

  @ApiProperty({ description: 'AC题目数' })
  @Column({ name: 'solved_count', type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '提交总数' })
  @Column({ name: 'total_submissions', type: 'int', default: 0 })
  submissionCount: number;

  @ApiProperty({ description: '学校/组织' })
  @Column({ name: 'organization', length: 100, nullable: true })
  organization: string;

  @ApiProperty({ description: '个人简介' })
  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: '是否禁用' })
  @Column({ name: 'is_banned', type: 'boolean', default: false })
  isBanned: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
