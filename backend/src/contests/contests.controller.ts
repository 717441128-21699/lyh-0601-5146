import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ContestStatus } from './entities/contest.entity';
import { RegistrationsService } from '../registrations/registrations.service';

@ApiTags('竞赛管理')
@Controller('contests')
export class ContestsController {
  constructor(
    private readonly contestsService: ContestsService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建竞赛（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() createContestDto: CreateContestDto, @CurrentUser() user: any) {
    return this.contestsService.create(createContestDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取公开竞赛列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contestsService.findAll(paginationDto);
  }

  @Get('admin')
  @ApiOperation({ summary: '获取所有竞赛列表（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.contestsService.findAllAdmin(paginationDto);
  }

  @Get('ongoing')
  @ApiOperation({ summary: '获取正在进行的竞赛' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getOngoingContests() {
    return this.contestsService.getOngoingContests();
  }

  @Get('upcoming')
  @ApiOperation({ summary: '获取即将开始的竞赛' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getUpcomingContests() {
    return this.contestsService.getUpcomingContests();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取竞赛详情' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '竞赛不存在' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const contest = await this.contestsService.findOne(+id);
    if (user && user.userId) {
      const registration = await this.registrationsService.findByContestAndUser(+id, user.userId);
      (contest as any).isRegistered = registration !== null && (registration as any).status !== 'cancelled';
      (contest as any).registrationInfo = registration;
    }
    return contest;
  }

  @Get(':id/registration-status')
  @ApiOperation({ summary: '检查当前用户报名状态' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRegistrationStatus(@Param('id') id: string, @CurrentUser() user: any) {
    const registration = await this.registrationsService.findByContestAndUser(+id, user.userId);
    const isRegistered = registration !== null && (registration as any).status !== 'cancelled';
    return { isRegistered, registration };
  }

  @Get(':id/groups')
  @ApiOperation({ summary: '获取竞赛组别列表' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getContestGroups(@Param('id') id: string) {
    return this.contestsService.getContestGroups(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新竞赛信息（管理员）' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  updatePut(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto) {
    return this.contestsService.update(+id, updateContestDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新竞赛信息（管理员）' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto) {
    return this.contestsService.update(+id, updateContestDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新竞赛状态（管理员）' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: ContestStatus) {
    return this.contestsService.updateStatus(+id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除竞赛（管理员）' })
  @ApiParam({ name: 'id', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.contestsService.remove(+id);
  }
}
