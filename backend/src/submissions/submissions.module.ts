import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { Submission } from './entities/submission.entity';
import { ProblemsModule } from '../problems/problems.module';
import { UsersModule } from '../users/users.module';
import { JudgeModule } from '../judge/judge.module';
import { AntiCheatModule } from '../anti-cheat/anti-cheat.module';
import { RegistrationsModule } from '../registrations/registrations.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    ProblemsModule,
    UsersModule,
    forwardRef(() => JudgeModule),
    forwardRef(() => AntiCheatModule),
    RegistrationsModule,
    ContestsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
