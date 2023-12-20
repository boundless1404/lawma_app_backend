import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsEntityUserAdmin } from '../shared/isEntityUserAdmin.guard';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { AuthTokenPayload } from '../lib/types';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
  GetLgaQuery,
  GetLgaWardQuery,
  GetStreetQuery,
} from './dtos/dto';
import { UtilsBillingService } from './utils-billing.service';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';

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

  @Post('lga')
  @UseGuards(IsAuthenticated)
  async createLga(@Body() createLgaDto: CreateLgaDto) {
    //
    await this.utilService.createLga(createLgaDto);
  }

  @Get('lga')
  @UseGuards(IsAuthenticated)
  async getLga(@Query() query: GetLgaQuery) {
    //
    return await this.utilService.getLgas(query.name);
  }

  @Post('lga-ward')
  @UseGuards(IsAuthenticated)
  async createLgaWard(@Body() createLgaWardDto: CreateLgaWardDto) {
    await this.utilService.createLgaWard(createLgaWardDto);
  }

  @Get('lga-ward')
  @UseGuards(IsAuthenticated)
  async getLgaWard(@Query() query: GetLgaWardQuery) {
    return await this.utilService.getLgaWards({ ...query });
  }

  @Post('street')
  @UseGuards(IsAuthenticated)
  async createStreet(
    @Body() createStreetDto: CreateStreetDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.createStreet(createStreetDto, authPayload);
  }

  @Get('street')
  @UseGuards(IsAuthenticated)
  async getStreet(
    @Query() query: GetStreetQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getStreets(
      authPayload.profile.entityProfileId,
      {
        ...query,
      },
    );
  }
}
