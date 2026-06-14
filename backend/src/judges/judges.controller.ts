import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JudgesService, CreateJudgeScoreDto } from './judges.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('评委打分')
@Controller('judges')
export class JudgesController {
  constructor(private readonly judgesService: JudgesService) {}

  @Post('scores')
  @ApiOperation({ summary: '提交评分（评委）' })
  @ApiResponse({ status: 201, description: '评分成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JUDGE, UserRole.ADMIN)
  @ApiBearerAuth()
  createScore(@Body() dto: CreateJudgeScoreDto, @CurrentUser() user: any) {
    return this.judgesService.create(dto, user.userId);
  }

  @Get('scores')
  @ApiOperation({ summary: '获取评分列表（评委/管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JUDGE, UserRole.ADMIN)
  @ApiBearerAuth()
  findAllScores(
    @Query() paginationDto: PaginationDto,
    @Query('submissionId') submissionId?: string,
    @Query('judgeId') judgeId?: string,
    @Query('problemId') problemId?: string,
  ) {
    return this.judgesService.findAll(paginationDto, {
      submissionId: submissionId ? +submissionId : undefined,
      judgeId: judgeId ? +judgeId : undefined,
      problemId: problemId ? +problemId : undefined,
    });
  }

  @Get('scores/submission/:submissionId')
  @ApiOperation({ summary: '获取某提交的所有评分' })
  @ApiParam({ name: 'submissionId', description: '提交ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.judgesService.findBySubmission(+submissionId);
  }

  @Get('scores/submission/:submissionId/average')
  @ApiOperation({ summary: '获取某提交的平均分' })
  @ApiParam({ name: 'submissionId', description: '提交ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAverageScore(@Param('submissionId') submissionId: string) {
    return this.judgesService.getAverageScore(+submissionId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: '获取评分详情' })
  @ApiParam({ name: 'id', description: '评分ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOneScore(@Param('id') id: string) {
    return this.judgesService.findOne(+id);
  }

  @Patch('scores/:id')
  @ApiOperation({ summary: '更新评分（评委）' })
  @ApiParam({ name: 'id', description: '评分ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JUDGE, UserRole.ADMIN)
  @ApiBearerAuth()
  updateScore(@Param('id') id: string, @Body() dto: Partial<CreateJudgeScoreDto>) {
    return this.judgesService.update(+id, dto);
  }

  @Delete('scores/:id')
  @ApiOperation({ summary: '删除评分（管理员）' })
  @ApiParam({ name: 'id', description: '评分ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeScore(@Param('id') id: string) {
    return this.judgesService.remove(+id);
  }
}
