import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('rankings')
@Index(['contestId', 'userId'], { unique: true })
export class Ranking {
  @ApiProperty({ description: '排名ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛ID' })
  @Column({ name: 'contest_id' })
  @Index()
  contestId: number;

  @ApiProperty({ description: '组别ID' })
  @Column({ name: 'group_id', nullable: true })
  groupId: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ApiProperty({ description: '总排名' })
  @Column({ name: 'rank', type: 'int' })
  rank: number;

  @ApiProperty({ description: '组别内排名' })
  @Column({ name: 'group_rank', type: 'int', nullable: true })
  groupRank: number;

  @ApiProperty({ description: '最终得分' })
  @Column({ name: 'score', type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: '解决题目数' })
  @Column({ name: 'solved_count', type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '总用时（秒）' })
  @Column({ name: 'total_time', type: 'int', default: 0 })
  totalTime: number;

  @ApiProperty({ description: 'rating变化值' })
  @Column({ name: 'rating_change', type: 'int', default: 0 })
  ratingChange: number;

  @ApiProperty({ description: '变化前rating' })
  @Column({ name: 'previous_rating', type: 'int', default: 0 })
  previousRating: number;

  @ApiProperty({ description: '变化后rating' })
  @Column({ name: 'new_rating', type: 'int', default: 0 })
  newRating: number;

  @ApiProperty({ description: '每题得分明细（JSON）' })
  @Column({ name: 'problem_scores', type: 'json', nullable: true })
  problemScores: any;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
