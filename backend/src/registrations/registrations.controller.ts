import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RegistrationStatus } from './entities/registration.entity';

@ApiTags('报名管理')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('contest/:contestId')
  @ApiOperation({ summary: '报名竞赛（自动分配赛道）' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 201, description: '报名成功' })
  @ApiResponse({ status: 400, description: '报名失败' })
  @ApiResponse({ status: 409, description: '已报名' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Param('contestId') contestId: string, @CurrentUser() user: any) {
    return this.registrationsService.create(+contestId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取所有报名记录（管理员）' })
  @ApiQuery({ name: 'contestId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('contestId') contestId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: RegistrationStatus,
    @Query('groupId') groupId?: string,
  ) {
    return this.registrationsService.findAll(paginationDto, {
      contestId: contestId ? +contestId : undefined,
      userId: userId ? +userId : undefined,
      status,
      groupId: groupId ? +groupId : undefined,
    });
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的报名记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyRegistrations(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.registrationsService.findByUser(user.userId, paginationDto);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: '获取竞赛的报名列表（管理员）' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  findByContest(@Param('contestId') contestId: string, @Query() paginationDto: PaginationDto) {
    return this.registrationsService.findByContest(+contestId, paginationDto);
  }

  @Get('contest/:contestId/rankings')
  @ApiOperation({ summary: '获取竞赛排行榜' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getContestRankings(@Param('contestId') contestId: string, @Query() paginationDto: PaginationDto) {
    return this.registrationsService.getContestRankings(+contestId, paginationDto);
  }

  @Get('contest/:contestId/group/:groupId/rankings')
  @ApiOperation({ summary: '获取竞赛组别排行榜' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiParam({ name: 'groupId', description: '组别ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getGroupRankings(
    @Param('contestId') contestId: string,
    @Param('groupId') groupId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.registrationsService.getGroupRankings(+contestId, +groupId, paginationDto);
  }

  @Get('contest/:contestId/stats')
  @ApiOperation({ summary: '获取竞赛报名统计' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getRegistrationStats(@Param('contestId') contestId: string) {
    return this.registrationsService.getRegistrationStats(+contestId);
  }

  @Get('contest/:contestId/check')
  @ApiOperation({ summary: '检查是否已报名' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkRegistration(@Param('contestId') contestId: string, @CurrentUser() user: any) {
    return this.registrationsService.isUserRegistered(+contestId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报名详情' })
  @ApiParam({ name: 'id', description: '报名ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(+id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消报名' })
  @ApiParam({ name: 'id', description: '报名ID' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.registrationsService.cancel(+id, user.userId);
  }
}
