import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgesService } from './judges.service';
import { JudgesController } from './judges.controller';
import { JudgeScore } from './entities/judge-score.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JudgeScore, Submission]),
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [JudgesController],
  providers: [JudgesService],
  exports: [JudgesService],
})
export class JudgesModule {}
