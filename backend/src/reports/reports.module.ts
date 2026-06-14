import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { OperationReport } from './entities/operation-report.entity';
import { User } from '../users/entities/user.entity';
import { Contest } from '../contests/entities/contest.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { AntiCheatRecord } from '../anti-cheat/entities/anti-cheat-record.entity';
import { Certificate } from '../certificates/entities/certificate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperationReport,
      User,
      Contest,
      Problem,
      Submission,
      Registration,
      AntiCheatRecord,
      Certificate,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
