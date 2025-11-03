import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { WasteOperatorService } from './services/waste-operator.service';
import { DataImportService } from './services/data-import.service';
import { ExcelParserService } from './services/excel-parser.service';
import { EntityProfile } from '../utils-billing/entitties/entityProfile.entity';
import { EntityUserProfile } from '../utils-billing/entitties/entityUserProfile.entity';
import { EntitySubscriberProfile } from '../utils-billing/entitties/entitySubscriberProfile.entity';
import { PropertySubscription } from '../utils-billing/entitties/propertySubscription.entity';
import { Street } from '../utils-billing/entitties/street.entity';
import { Lga } from '../utils-billing/entitties/lga.entity';
import { LgaWard } from '../utils-billing/entitties/lgaWard.entity';
import { PropertyType } from '../utils-billing/entitties/propertyTypes.entity';
import { EntitySubscriberProperty } from '../utils-billing/entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from '../utils-billing/entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from '../utils-billing/entitties/billingAccount.entity';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntityProfile,
      EntityUserProfile,
      EntitySubscriberProfile,
      PropertySubscription,
      Street,
      Lga,
      LgaWard,
      PropertyType,
      EntitySubscriberProperty,
      PropertySubscriptionUnit,
      BillingAccount,
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [OnboardingController],
  providers: [WasteOperatorService, DataImportService, ExcelParserService],
  exports: [WasteOperatorService, DataImportService, ExcelParserService],
})
export class OnboardingModule {}
