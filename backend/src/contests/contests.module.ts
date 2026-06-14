import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { Contest } from './entities/contest.entity';
import { ContestGroup } from './entities/contest-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contest, ContestGroup])],
  controllers: [ContestsController],
  providers: [ContestsService],
  exports: [ContestsService],
})
export class ContestsModule {}
