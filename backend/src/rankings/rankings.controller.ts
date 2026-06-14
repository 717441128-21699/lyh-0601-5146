import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('排名管理')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('contest/:contestId')
  @ApiOperation({ summary: '获取竞赛总排名' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getContestRankings(@Param('contestId') contestId: string, @Query() paginationDto: PaginationDto) {
    return this.rankingsService.getContestRankings(+contestId, paginationDto);
  }

  @Get('contest/:contestId/group/:groupId')
  @ApiOperation({ summary: '获取竞赛组别排名' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiParam({ name: 'groupId', description: '组别ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getGroupRankings(
    @Param('contestId') contestId: string,
    @Param('groupId') groupId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.rankingsService.getGroupRankings(+contestId, +groupId, paginationDto);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的竞赛排名历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyRankings(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.rankingsService.getUserRankings(user.userId, paginationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的竞赛排名历史' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getUserRankings(@Param('userId') userId: string, @Query() paginationDto: PaginationDto) {
    return this.rankingsService.getUserRankings(+userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条排名记录' })
  @ApiParam({ name: 'id', description: '排名ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.rankingsService.findOne(+id);
  }
}
