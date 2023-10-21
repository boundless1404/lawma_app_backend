import { Module } from '@nestjs/common';
import { UtilsBillingController } from './utils-billing.controller';
import { UtilsBillingService } from './utils-billing.service';

@Module({
  controllers: [UtilsBillingController],
  providers: [UtilsBillingService]
})
export class UtilsBillingModule {}
