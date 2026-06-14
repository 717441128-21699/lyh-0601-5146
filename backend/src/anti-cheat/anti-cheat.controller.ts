import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AntiCheatService } from './anti-cheat.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AntiCheatSeverity, AntiCheatReviewStatus } from './entities/anti-cheat-record.entity';

@ApiTags('反作弊管理')
@Controller('anti-cheat')
export class AntiCheatController {
  constructor(private readonly antiCheatService: AntiCheatService) {}

  @Get('records')
  @ApiOperation({ summary: '获取反作弊记录列表（管理员/评委）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('problemId') problemId?: string,
    @Query('userId') userId?: string,
    @Query('severity') severity?: AntiCheatSeverity,
    @Query('isHandled') isHandled?: string,
    @Query('status') status?: AntiCheatReviewStatus,
  ) {
    return this.antiCheatService.findAll(paginationDto, {
      problemId: problemId ? +problemId : undefined,
      userId: userId ? +userId : undefined,
      severity,
      isHandled: isHandled !== undefined ? isHandled === 'true' : undefined,
      status,
    });
  }

  @Get('records/:id')
  @ApiOperation({ summary: '获取反作弊记录详情（管理员/评委）' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.antiCheatService.findOne(+id);
  }

  @Post('records/:id/review')
  @ApiOperation({ summary: '复核反作弊记录（管理员）' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @ApiResponse({ status: 200, description: '复核成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  review(
    @Param('id') id: string,
    @Body('status') status: AntiCheatReviewStatus,
    @Body('reviewNote') reviewNote: string,
    @CurrentUser() user: any,
  ) {
    return this.antiCheatService.reviewRecord(+id, status, reviewNote, user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取反作弊统计（管理员/评委）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  @ApiBearerAuth()
  getStats() {
    return this.antiCheatService.getStats();
  }
}
