import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Contest } from './contest.entity';

export enum ContestGroupLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  MASTER = 'master',
}

@Entity('contest_groups')
export class ContestGroup {
  @ApiProperty({ description: '组别ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '竞赛ID' })
  @Column()
  contestId: number;

  @ApiProperty({ description: '组别名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '组别级别', enum: ContestGroupLevel })
  @Column({
    type: 'enum',
    enum: ContestGroupLevel,
    default: ContestGroupLevel.INTERMEDIATE,
  })
  level: ContestGroupLevel;

  @ApiProperty({ description: '最小rating' })
  @Column({ type: 'int', default: 0 })
  minRating: number;

  @ApiProperty({ description: '最大rating' })
  @Column({ type: 'int', default: 9999 })
  maxRating: number;

  @ApiProperty({ description: '最大容量' })
  @Column({ type: 'int', default: 100 })
  maxCapacity: number;

  @ApiProperty({ description: '当前报名人数' })
  @Column({ type: 'int', default: 0 })
  currentCount: number;

  @ApiProperty({ description: '描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Contest, (contest) => contest.groups)
  @JoinColumn({ name: 'contestId' })
  contest: Contest;
}
