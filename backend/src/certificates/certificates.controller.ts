import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CertificateType, CertificateLevel } from './entities/certificate.entity';

@ApiTags('证书成绩单')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: '获取我的证书列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMyCertificates(
    @Query() paginationDto: PaginationDto,
    @Query('type') type?: CertificateType,
    @CurrentUser() user: any,
  ) {
    return this.certificatesService.findByUser(user.userId, paginationDto);
  }

  @Get('verify/:number')
  @ApiOperation({ summary: '验证证书真伪' })
  @ApiParam({ name: 'number', description: '证书编号' })
  @ApiResponse({ status: 200, description: '验证成功' })
  verify(@Param('number') number: string) {
    return this.certificatesService.verify(number);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的证书列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByUser(@Param('userId') userId: string, @Query() paginationDto: PaginationDto) {
    return this.certificatesService.findByUser(+userId, paginationDto);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: '获取竞赛的证书列表（管理员）' })
  @ApiParam({ name: 'contestId', description: '竞赛ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByContest(@Param('contestId') contestId: string, @Query() paginationDto: PaginationDto) {
    return this.certificatesService.findByContest(+contestId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取证书详情' })
  @ApiParam({ name: 'id', description: '证书ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(+id);
  }

  @Post(':id/downloaded')
  @ApiOperation({ summary: '标记证书已下载' })
  @ApiParam({ name: 'id', description: '证书ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markDownloaded(@Param('id') id: string) {
    return this.certificatesService.markDownloaded(+id);
  }
}
