import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SubmissionStatus, ProgrammingLanguage } from './entities/submission.entity';

@ApiTags('提交管理')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: '提交代码' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  submit(@Body() submitCodeDto: SubmitCodeDto, @CurrentUser() user: any) {
    return this.submissionsService.submit(submitCodeDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取提交列表' })
  @ApiQuery({ name: 'problemId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'contestId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  @ApiQuery({ name: 'language', required: false, enum: ProgrammingLanguage })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('problemId') problemId?: string,
    @Query('userId') userId?: string,
    @Query('contestId') contestId?: string,
    @Query('status') status?: SubmissionStatus,
    @Query('language') language?: ProgrammingLanguage,
  ) {
    return this.submissionsService.findAll(paginationDto, {
      problemId: problemId ? +problemId : undefined,
      userId: userId ? +userId : undefined,
      contestId: contestId ? +contestId : undefined,
      status,
      language,
    });
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的提交记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMySubmissions(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.submissionsService.findByUser(user.userId, paginationDto);
  }

  @Get('problem/:problemId')
  @ApiOperation({ summary: '获取某题目的提交列表' })
  @ApiParam({ name: 'problemId', description: '题目ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByProblem(@Param('problemId') problemId: string, @Query() paginationDto: PaginationDto) {
    return this.submissionsService.findByProblem(+problemId, paginationDto);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: '获取某竞赛的提交列表（管理员/评委）' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  findByContest(@Param('contestId') contestId: string, @Query() paginationDto: PaginationDto) {
    return this.submissionsService.findByContest(+contestId, paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取提交统计' })
  @ApiQuery({ name: 'problemId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(
    @Query('problemId') problemId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.submissionsService.getSubmissionStats(
      problemId ? +problemId : undefined,
      userId ? +userId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取提交详情' })
  @ApiParam({ name: 'id', description: '提交ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '提交不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(+id);
  }
}
