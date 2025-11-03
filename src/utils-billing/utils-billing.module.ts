import { Module } from '@nestjs/common';
import { UtilsBillingController } from './utils-billing.controller';
import { UtilsBillingService } from './utils-billing.service';
import { SharedModule } from '../shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    SharedModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [UtilsBillingController],
  providers: [UtilsBillingService],
})
export class UtilsBillingModule {}
