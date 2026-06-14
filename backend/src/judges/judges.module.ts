import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudgesService } from './judges.service';
import { JudgesController } from './judges.controller';
import { JudgeScore } from './entities/judge-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JudgeScore])],
  controllers: [JudgesController],
  providers: [JudgesService],
  exports: [JudgesService],
})
export class JudgesModule {}
