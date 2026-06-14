import { IsString, IsOptional, IsInt, IsDate, IsEnum, Min, MaxLength, IsArray, ValidateNested, ArrayNotEmpty, IsNumber, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestType, ContestDifficulty } from '../entities/contest.entity';

class ContestGroupDto {
  @ApiProperty({ description: '组别名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '组别描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '最小rating' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({ description: '最大rating' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxRating?: number;

  @ApiProperty({ description: '最大容量' })
  @IsInt()
  @Min(1)
  maxCapacity: number;
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

  @ApiProperty({ description: '竞赛难度', enum: ContestDifficulty })
  @IsEnum(ContestDifficulty)
  difficulty: ContestDifficulty;

  @ApiProperty({ description: '主办方' })
  @IsString()
  @MaxLength(100)
  organizer: string;

  @ApiPropertyOptional({ description: '最大参赛人数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional({ description: '反作弊检测阈值' })
  @IsOptional()
  @IsNumber()
  antiCheatThreshold?: number;

  @ApiPropertyOptional({ description: '检查点数量' })
  @IsOptional()
  @IsInt()
  @Min(1)
  checkPointCount?: number;

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
