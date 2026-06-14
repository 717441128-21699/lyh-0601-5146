import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('rankings')
@Index(['contestId', 'userId'], { unique: true })
export class Ranking {
  @ApiProperty({ description: '排名ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛ID' })
  @Column()
  @Index()
  contestId: number;

  @ApiProperty({ description: '组别ID' })
  @Column({ nullable: true })
  groupId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '总排名' })
  @Column({ type: 'int' })
  rank: number;

  @ApiProperty({ description: '组别内排名' })
  @Column({ type: 'int', nullable: true })
  groupRank: number;

  @ApiProperty({ description: '最终得分' })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '解决题目数' })
  @Column({ type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '总用时（秒）' })
  @Column({ type: 'int', default: 0 })
  totalTime: number;

  @ApiProperty({ description: 'rating变化值' })
  @Column({ type: 'int', default: 0 })
  ratingChange: number;

  @ApiProperty({ description: '变化前rating' })
  @Column({ type: 'int', default: 0 })
  previousRating: number;

  @ApiProperty({ description: '变化后rating' })
  @Column({ type: 'int', default: 0 })
  newRating: number;

  @ApiProperty({ description: '每题得分明细（JSON）' })
  @Column({ type: 'json', nullable: true })
  problemScores: any;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
