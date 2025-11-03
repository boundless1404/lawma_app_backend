import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RequestService } from './request/request.service';
import { HelpersService } from './helpers/helpers.service';
import { ProfileService } from './profile/profile.service';
import { HttpModule } from '@nestjs/axios';
import { PaystackServiceService } from './paystack_service/paystack_service.service';
import { WalletServiceService } from './wallet-service/wallet-service.service';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { TermiiService } from './termii/termii.service';
import { ResendService } from './resend/resend.service';
import { NotificationService } from './notification.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      async useFactory(configService: ConfigService) {
        await ConfigModule.envVariablesLoaded;

        return {
          signOptions: {
            expiresIn: configService.get('app.JWT_EXPIRY', '8h'),
          },
          secret: configService.get('app.JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [RbacController],
  providers: [
    SharedService,
    JwtService,
    RequestService,
    HelpersService,
    ProfileService,
    PaystackServiceService,
    WalletServiceService,
    RbacService,
    TermiiService,
    ResendService,
    NotificationService,
  ],
  exports: [
    SharedService,
    JwtService,
    HelpersService,
    ProfileService,
    RequestService,
    PaystackServiceService,
    WalletServiceService,
    RbacService,
    TermiiService,
    ResendService,
    NotificationService,
  ],
})
export class SharedModule {}
