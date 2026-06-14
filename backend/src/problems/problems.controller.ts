import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProblemsService, CreateProblemDto, UpdateProblemDto } from './problems.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProblemDifficulty } from './entities/problem.entity';

@ApiTags('题目管理')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  @ApiOperation({ summary: '创建题目（管理员/评委）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  create(@Body() createProblemDto: CreateProblemDto, @CurrentUser() user: any) {
    return this.problemsService.create(createProblemDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取公开题目列表' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ProblemDifficulty })
  @ApiQuery({ name: 'contestId', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('difficulty') difficulty?: ProblemDifficulty,
    @Query('contestId') contestId?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.problemsService.findAll(paginationDto, {
      difficulty,
      contestId: contestId ? +contestId : undefined,
      keyword,
    });
  }

  @Get('admin')
  @ApiOperation({ summary: '获取所有题目列表（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.problemsService.findAllAdmin(paginationDto);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: '获取竞赛的题目列表' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByContestId(@Param('contestId') contestId: string) {
    return this.problemsService.findByContestId(+contestId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '题目不存在' })
  findOne(@Param('id') id: string) {
    return this.problemsService.findOne(+id);
  }

  @Get(':id/acceptance-rate')
  @ApiOperation({ summary: '获取题目通过率' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAcceptanceRate(@Param('id') id: string) {
    return this.problemsService.getAcceptanceRate(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新题目信息（管理员/评委）' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProblemDto: UpdateProblemDto) {
    return this.problemsService.update(+id, updateProblemDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布题目（管理员/评委）' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  publish(@Param('id') id: string) {
    return this.problemsService.publish(+id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: '归档题目（管理员/评委）' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '归档成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  archive(@Param('id') id: string) {
    return this.problemsService.archive(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除题目（管理员）' })
  @ApiParam({ name: 'id', description: '题目ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.problemsService.remove(+id);
  }
}
