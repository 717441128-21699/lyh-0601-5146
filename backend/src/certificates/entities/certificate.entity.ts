import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum CertificateType {
  PARTICIPATION = 'participation',
  ACHIEVEMENT = 'achievement',
  AWARD = 'award',
  TRANSCRIPT = 'transcript',
}

export enum CertificateLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('certificates')
@Unique(['contestId', 'userId', 'type'])
export class Certificate {
  @ApiProperty({ description: '证书ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '证书编号' })
  @Column({ unique: true, length: 50 })
  certificateNumber: string;

  @ApiProperty({ description: '竞赛ID' })
  @Column()
  @Index()
  contestId: number;

  @ApiProperty({ description: '用户ID' })
  @Column()
  @Index()
  userId: number;

  @ApiProperty({ description: '证书类型', enum: CertificateType })
  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.PARTICIPATION,
  })
  type: CertificateType;

  @ApiProperty({ description: '等级（奖项证书）', enum: CertificateLevel })
  @Column({
    type: 'enum',
    enum: CertificateLevel,
    nullable: true,
  })
  level: CertificateLevel;

  @ApiProperty({ description: '标题' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '描述/内容' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '最终排名' })
  @Column({ type: 'int', nullable: true })
  finalRank: number;

  @ApiProperty({ description: '最终得分' })
  @Column({ type: 'int', default: 0 })
  finalScore: number;

  @ApiProperty({ description: '解决题目数' })
  @Column({ type: 'int', default: 0 })
  solvedCount: number;

  @ApiProperty({ description: '成绩明细（JSON）' })
  @Column({ type: 'json', nullable: true })
  scoreDetails: any;

  @ApiProperty({ description: '证书图片URL' })
  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @ApiProperty({ description: '是否已下载' })
  @Column({ type: 'boolean', default: false })
  isDownloaded: boolean;

  @ApiProperty({ description: '颁发时间' })
  @Column({ type: 'datetime' })
  issuedAt: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;
}
