import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  JUDGE = 'judge',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 50, nullable: true })
  nickname: string;

  @ApiProperty({ description: '头像' })
  @Column({ length: 255, nullable: true })
  avatar: string;

  @ApiProperty({ description: '用户角色', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: '用户rating积分' })
  @Column({ type: 'int', default: 1500 })
  rating: number;

  @ApiProperty({ description: '参赛次数' })
  @Column({ type: 'int', default: 0 })
  contestCount: number;

  @ApiProperty({ description: 'AC题目数' })
  @Column({ type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '提交总数' })
  @Column({ type: 'int', default: 0 })
  submissionCount: number;

  @ApiProperty({ description: '学校/组织' })
  @Column({ length: 100, nullable: true })
  organization: string;

  @ApiProperty({ description: '个人简介' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: '是否禁用' })
  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
