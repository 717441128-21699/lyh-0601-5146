import { PartialType } from '@nestjs/swagger';
import { CreateContestDto } from './create-contest.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ContestStatus } from '../entities/contest.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContestDto extends PartialType(CreateContestDto) {
  @ApiPropertyOptional({ description: '竞赛状态', enum: ContestStatus })
  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;
}
