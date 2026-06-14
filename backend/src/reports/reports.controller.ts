import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReportPeriod } from './entities/operation-report.entity';

@ApiTags('运营报表')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: '获取运营报表列表（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll(@Query() paginationDto: PaginationDto, @Query('period') period?: ReportPeriod) {
    return this.reportsService.findAll(paginationDto, { period });
  }

  @Get('/monthly')
  @ApiOperation({ summary: '获取月度报表（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  getMonthlyReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getMonthlyReport(
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: '获取运营概要数据（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('latest')
  @ApiOperation({ summary: '获取最新报表（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  getLatestReport() {
    return this.reportsService.getLatestReport();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报表详情（管理员）' })
  @ApiParam({ name: 'id', description: '报表ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Post('generate')
  @ApiOperation({ summary: '手动生成报表（管理员）' })
  @ApiResponse({ status: 201, description: '生成成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  generateReport(
    @Body('period') period: ReportPeriod,
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    return this.reportsService.generateReport(
      period || ReportPeriod.MONTHLY,
      new Date(periodStart),
      new Date(periodEnd),
      false,
    );
  }
}
