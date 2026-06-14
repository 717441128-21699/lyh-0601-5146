import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Contest } from './contest.entity';

@Entity('contest_groups')
export class ContestGroup {
  @ApiProperty({ description: '组别ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛ID' })
  @Column({ name: 'contest_id' })
  contestId: number;

  @ApiProperty({ description: '组别名称' })
  @Column({ name: 'name', length: 100 })
  name: string;

  @ApiProperty({ description: '组别描述' })
  @Column({ name: 'description', length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: '最小rating' })
  @Column({ name: 'min_rating', type: 'int', nullable: true })
  minRating: number;

  @ApiProperty({ description: '最大rating' })
  @Column({ name: 'max_rating', type: 'int', nullable: true })
  maxRating: number;

  @ApiProperty({ description: '最大容量' })
  @Column({ name: 'capacity', type: 'int' })
  maxCapacity: number;

  @ApiProperty({ description: '当前报名人数' })
  @Column({ name: 'current_count', type: 'int', default: 0 })
  currentCount: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Contest, (contest) => contest.groups)
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;
}
