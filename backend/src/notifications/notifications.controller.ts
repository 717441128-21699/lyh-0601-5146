import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationType } from './entities/notification.entity';

@ApiTags('消息通知')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取我的通知列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyNotifications(
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.findByUser(user.userId, paginationDto, {
      type,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }

  @Post('send')
  @ApiOperation({ summary: '发送通知（管理员）' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  sendNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }
}
