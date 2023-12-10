import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsEntityUserAdmin } from '../shared/isEntityUserAdmin.guard';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { AuthTokenPayload } from '../lib/types';
import { CreateSubscriptionDto, CreateUserDto } from './dtos/dto';
import { UtilsBillingService } from './utils-billing.service';

@Controller('utils-billing')
export class UtilsBillingController {
  constructor(private utilService: UtilsBillingService) {
    //
  }

  // create user
  // would create both entity user and subscriber user
  // differentiate with a flag
  @Post('user')
  @UseGuards(new IsEntityUserAdmin())
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.createUser(createUserDto, authPayload);
  }

  @Post('subscription')
  @UseGuards(new IsEntityUserAdmin())
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.createPropertySubscription(
      createSubscriptionDto,
      authPayload,
    );
  }
}
