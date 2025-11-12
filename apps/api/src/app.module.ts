import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { MembersModule } from './modules/members/members.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ApplicationsModule,
    MembersModule,
    PaymentsModule,
    HealthModule,
  ],
})
export class AppModule {}
