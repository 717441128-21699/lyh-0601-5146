import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContestsModule } from './contests/contests.module';
import { ProblemsModule } from './problems/problems.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { RankingsModule } from './rankings/rankings.module';
import { AntiCheatModule } from './anti-cheat/anti-cheat.module';
import { JudgesModule } from './judges/judges.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ReportsModule } from './reports/reports.module';
import { JudgeModule } from './judge/judge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        charset: configService.get('database.charset'),
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ContestsModule,
    ProblemsModule,
    RegistrationsModule,
    SubmissionsModule,
    RankingsModule,
    AntiCheatModule,
    JudgesModule,
    NotificationsModule,
    CertificatesModule,
    ReportsModule,
    JudgeModule,
  ],
})
export class AppModule {}
