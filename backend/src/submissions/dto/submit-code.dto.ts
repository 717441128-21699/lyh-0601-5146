import { IsString, IsInt, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgrammingLanguage } from '../entities/submission.entity';

export class SubmitCodeDto {
  @ApiProperty({ description: '题目ID' })
  @IsInt()
  @Min(1)
  problemId: number;

  @ApiProperty({ description: '编程语言', enum: ProgrammingLanguage })
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @ApiProperty({ description: '源代码' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '竞赛ID' })
  @IsOptional()
  @IsInt()
  contestId?: number;

  @ApiPropertyOptional({ description: '报名ID' })
  @IsOptional()
  @IsInt()
  registrationId?: number;
}
