import { IsString, IsOptional, IsInt, IsBoolean, IsDate, IsEnum, Min, MaxLength, IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestStatus, ContestType } from '../entities/contest.entity';
import { ContestGroupLevel } from '../entities/contest-group.entity';

class ContestGroupDto {
  @ApiProperty({ description: '组别名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '组别级别', enum: ContestGroupLevel })
  @IsEnum(ContestGroupLevel)
  level: ContestGroupLevel;

  @ApiProperty({ description: '最小rating' })
  @IsInt()
  @Min(0)
  minRating: number;

  @ApiProperty({ description: '最大rating' })
  @IsInt()
  @Min(0)
  maxRating: number;

  @ApiProperty({ description: '最大容量' })
  @IsInt()
  @Min(1)
  maxCapacity: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateContestDto {
  @ApiProperty({ description: '竞赛标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '竞赛简介' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '竞赛类型', enum: ContestType })
  @IsEnum(ContestType)
  type: ContestType;

  @ApiPropertyOptional({ description: '封面图片' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '报名开始时间' })
  @Type(() => Date)
  @IsDate()
  registrationStartTime: Date;

  @ApiProperty({ description: '报名结束时间' })
  @Type(() => Date)
  @IsDate()
  registrationEndTime: Date;

  @ApiProperty({ description: '竞赛开始时间' })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({ description: '竞赛结束时间' })
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiPropertyOptional({ description: '总题目数' })
  @IsOptional()
  @IsInt()
  @Min(0)
  problemCount?: number;

  @ApiPropertyOptional({ description: '总分值' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalScore?: number;

  @ApiPropertyOptional({ description: '是否启用自动分配赛道', default: true })
  @IsOptional()
  @IsBoolean()
  autoAssignTrack?: boolean;

  @ApiPropertyOptional({ description: '是否公开', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: '访问密码' })
  @IsOptional()
  @IsString()
  accessPassword?: string;

  @ApiPropertyOptional({ description: '规则说明' })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({ description: '奖励说明' })
  @IsOptional()
  @IsString()
  prizes?: string;

  @ApiProperty({ type: [ContestGroupDto], description: '竞赛组别列表' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ContestGroupDto)
  groups: ContestGroupDto[];
}
