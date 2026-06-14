import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntiCheatService } from './anti-cheat.service';
import { AntiCheatController } from './anti-cheat.controller';
import { AntiCheatRecord } from './entities/anti-cheat-record.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AntiCheatRecord, Submission, User]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AntiCheatController],
  providers: [AntiCheatService],
  exports: [AntiCheatService],
})
export class AntiCheatModule {}
