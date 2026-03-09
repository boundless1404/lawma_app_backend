import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsEntityUserAdmin } from '../shared/isEntityUserAdmin.guard';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { AuthTokenPayload, PaystackWebhookEventObject } from '../lib/types';
import { PermissionGuard } from '../shared/guards/permission.guard';
import {
  RequirePermissions,
  PERMISSIONS,
} from '../shared/decorators/auth.decorators';
import { EntityUserProfile } from './entitties/entityUserProfile.entity';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreatePropertyTypesDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
  GetLgaQuery,
  GetLgaWardQuery,
  GetStreetQuery,
  GetPropertyTypeQuery,
  GetPhoneCodesQuery,
  GetSubscriptionQuery,
  GenerateBillingDto,
  GetPaymentsQuery,
  GetBillingQuery,
  PostPaymentDto,
  SavePropertyUnitsDetailsDto,
  UpdateAccontRecordDto,
  UpdatePropertyNameDto,
} from './dtos/dto';
import { UtilsBillingService } from './utils-billing.service';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';
import { ProfileTypes } from '../lib/enums';
import { UpdatePropertySubscriptionValidationPipe } from './dtos/custom-pipes';
import { NotificationService } from '../shared/notification.service';
import { NotificationQueue, NotificationStatus, NotificationChannel, NotificationType } from '../shared/notificationQueue.entity';

@Controller('utils-billing')
export class UtilsBillingController {
  private dbManager: DataSource;

  constructor(
    private utilService: UtilsBillingService,
    dbManager: DataSource,
    private notificationService: NotificationService,
  ) {
    this.dbManager = dbManager;
  }

  // create user
  // would create both entity user and subscriber user
  // differentiate with a flag
  @Post('user')
  @UseGuards(PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.createUser(createUserDto, authPayload);
  }

  @Post('subscriber-user')
  @UseGuards(IsAuthenticated)
  async createSubscriberUser(
    @Body() createUserDto: CreateUserDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    // update the profileType
    createUserDto.profileType = ProfileTypes.ENTITY_SUBSCRIBER_PROFILE;
    await this.utilService.createUser(createUserDto, authPayload);
  }

  @Get('subscriber-user')
  @UseGuards(IsAuthenticated)
  async getSubscriberUser(@GetAuthPayload() authPayload: AuthTokenPayload) {
    // Try to get entityProfileId from token first
    let entityProfileId = authPayload.profile?.entityProfileId;

    // If not in token, fetch from database using the user's profile info
    if (!entityProfileId && authPayload.profile?.profileTypeId) {
      const userProfile = await this.dbManager.manager.findOne(
        EntityUserProfile,
        {
          where: { id: authPayload.profile.profileTypeId },
          select: ['entityProfileId'],
        },
      );

      if (userProfile) {
        entityProfileId = userProfile.entityProfileId;
      }
    }

    if (!entityProfileId) {
      throw new BadRequestException(
        'Entity profile ID not found for the current user',
      );
    }

    return await this.utilService.getEntityUserSubscriberByEntityProfileId(
      entityProfileId,
    );
  }

  @Post('subscription')
  @UseGuards(PermissionGuard)
  @RequirePermissions(PERMISSIONS.PROPERTIES_CREATE)
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

  @Get('subscription')
  @UseGuards(PermissionGuard)
  @RequirePermissions(PERMISSIONS.PROPERTIES_READ)
  async getSubscriptions(
    @Query() getSubscriptionQuery: GetSubscriptionQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    return await this.utilService.getSubscriptions(
      authPayload.profile.entityProfileId,
      {
        rowsPerPage: Number(getSubscriptionQuery.rowsPerPage || 10),
        page: Number(getSubscriptionQuery.page || 1),
        descending: JSON.parse(getSubscriptionQuery.descending || 'false'),
        filter: getSubscriptionQuery.filter,
        sortBy: getSubscriptionQuery.sortBy,
        streetId: getSubscriptionQuery.streetId,
      },
    );
  }

  @Get('subscription/details')
  @UseGuards(PermissionGuard)
  @RequirePermissions(PERMISSIONS.PROPERTIES_READ)
  async getSubscriptionDetails(
    @Query() query: Record<string, string>,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getSubscriptionDetails(
      authPayload.profile.entityProfileId,
      query.propertySubscriptionId,
    );
  }

  @Put('subscription/property-units')
  @UseGuards(IsAuthenticated)
  async savePropertyUnits(
    @GetAuthPayload() authPayload: AuthTokenPayload,
    @Body() propertyUnits: SavePropertyUnitsDetailsDto,
  ) {
    await this.utilService.savePropertyUnits(
      authPayload.profile.entityProfileId,
      propertyUnits,
    );

    return;
  }

  @Put('subscription/:action')
  @UseGuards(IsAuthenticated)
  async updateSubscriptionDetails(
    @Param('action') param: string,
    @Body(UpdatePropertySubscriptionValidationPipe)
    body: UpdatePropertyNameDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.updatePropertySubscriptionName({
      name: body.propertySubscriptionName,
      propertySubscriptionId: body.propertySubscriptionId,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Patch('subscription/:id/toggle-billing')
  @UseGuards(IsAuthenticated)
  async toggleBillingStatus(
    @Param('id') propertySubscriptionId: string,
    @Body() body: { isBillingActive: boolean },
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.toggleBillingStatus({
      propertySubscriptionId,
      isBillingActive: body.isBillingActive,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Delete('subscription/:id')
  @UseGuards(IsAuthenticated)
  async deletePropertySubscription(
    @Param('id') propertySubscriptionId: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.deletePropertySubscription({
      propertySubscriptionId,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Post('billing')
  @UseGuards(IsAuthenticated)
  async generateBilling(
    @Body() generateBillingDto: GenerateBillingDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.generateBilling(
      generateBillingDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('billing')
  @UseGuards(IsAuthenticated)
  async getBilling(
    @Query() getBillingQuery: GetBillingQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getBilling(
      getBillingQuery,
      authPayload.profile.entityProfileId,
    );
  }

  @Delete('billing')
  @UseGuards(IsAuthenticated)
  async deleteBilling(
    @Query('billingId') billingId: string,
    @GetAuthPayload() authTokenPayload: AuthTokenPayload,
  ) {
    await this.utilService.deleteBilling({
      billingId,
      entityProfileId: authTokenPayload.profile.entityProfileId,
    });
  }

  @Put('billing/account')
  @UseGuards(IsAuthenticated)
  async updateAccountRecord(
    @Body() updateAccountRecordDto: UpdateAccontRecordDto,
    @GetAuthPayload() authTokenPayload: AuthTokenPayload,
  ) {
    await this.utilService.updateAccountRecord({
      billingArrears: updateAccountRecordDto.arrears,
      propertySubscriptionId: updateAccountRecordDto.propertySubscriptionId,
      entityProfileId: authTokenPayload.profile.entityProfileId,
      entityUserProfileId: authTokenPayload.profile.id,
      reason: updateAccountRecordDto.reason,
      phone: updateAccountRecordDto.phone,
      phoneCodeId: updateAccountRecordDto.phoneCodeId,
      phoneCode: updateAccountRecordDto.phoneCode,
    });
  }

  @Get('billing/account/arrears')
  @UseGuards(IsAuthenticated)
  async getBillingAccountArrears(
    @Query() query: { page: number; limit: number },
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingAccountArrears(
      authPayload.profile.entityProfileId,
      query,
    );
  }

  @Get('billing/account/street/:streetId/defaulter')
  @UseGuards(IsAuthenticated)
  async getBillingPaymentDefaulters(
    @Param('streetId') streetId: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingDetailsOrDefaulters(
      authPayload.profile.entityProfileId,
      { streetId },
    );
  }

  @Get('billing/account/street/:streetId/detail')
  @UseGuards(IsAuthenticated)
  async getBillingDetails(
    @Param('streetId') streetId: string,
    @Query()
    {
      billingMonth,
      propertySubscriptionId,
      billingYear,
    }: {
      billingMonth: string;
      propertySubscriptionId: string;
      billingYear?: string;
    },
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingDetailsOrDefaulters(
      authPayload.profile.entityProfileId,
      {
        streetId,
        billingMonth,
        propertySubscriptionId,
        billingYear: billingYear ? parseInt(billingYear) : undefined,
      },
    );
  }

  @Post('payment')
  @UseGuards(IsAuthenticated)
  async postPayment(
    @Body() postPaymentDto: PostPaymentDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.postPayment(
      postPaymentDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('payment')
  @UseGuards(IsAuthenticated)
  async getPayments(
    @Query()
    query: GetPaymentsQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getPayments({
      ...query,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Delete('payment/:id')
  @UseGuards(IsAuthenticated)
  async deletePayment(
    @Param('id') paymentId: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.deletePayment(
      paymentId,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('payment/daily-csv')
  @UseGuards(IsAuthenticated)
  async getDailyPaymentsCSV(
    @Query('date') date: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
    @Res() res: any,
  ) {
    const csvContent = await this.utilService.getDailyPaymentsCSV(
      date,
      authPayload.profile.entityProfileId,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="daily-payments-${date}.csv"`,
    );
    res.send(csvContent);
  }

  @Get('payment/range-csv')
  @UseGuards(IsAuthenticated)
  async getDateRangePaymentsCSV(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
    @Res() res: any,
  ) {
    const csvContent = await this.utilService.getDateRangePaymentsCSV(
      startDate,
      endDate,
      authPayload.profile.entityProfileId,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="payments-range-${startDate}-to-${endDate}.csv"`,
    );
    res.send(csvContent);
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

  @Post('property-type')
  @UseGuards(IsAuthenticated)
  async createPropertyType(
    @Body() createPropertyTypeDto: CreatePropertyTypesDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.createPropertyType(
      createPropertyTypeDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('property-type')
  @UseGuards(IsAuthenticated)
  async getPropertyTypes(
    @Query() query: GetPropertyTypeQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getPropertyTypes(
      authPayload.profile.entityProfileId,
      { ...query },
    );
  }

  @Get('phone-code')
  @UseGuards(IsAuthenticated)
  async getPhoneCodes(@Query() query: GetPhoneCodesQuery) {
    return await this.utilService.getPhoneCode(query);
  }

  @Get('/dashboard/metrics')
  @UseGuards(IsAuthenticated)
  async getDashboardMetrics(@GetAuthPayload() authPayload: AuthTokenPayload) {
    return await this.utilService.getDashboardMetrics(
      authPayload.profile.entityProfileId,
    );
  }

  @Get('operator/metrics')
  async getMetrics(@GetAuthPayload() authPayload: AuthTokenPayload['profile']) {
    return await this.utilService.getOperatorMetrics(
      authPayload.entityProfileId,
    );
  }

  @Get('debug/notifications/:phone')
  async checkNotificationStatus(@Param('phone') phone: string) {
    const notifications = await this.dbManager.manager.query(
      `SELECT id, status, recipient_phone, retry_count, error_message, created_at, sent_at 
       FROM notification_queue 
       WHERE recipient_phone = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [phone],
    );
    return { phone, notifications };
  }

  @Patch('debug/notifications/:id/reset')
  async resetNotification(@Param('id') id: string) {
    await this.dbManager.manager.query(
      `UPDATE notification_queue 
       SET status = 'PENDING', retry_count = 0, error_message = NULL 
       WHERE id = $1`,
      [id],
    );
    return { message: 'Notification reset to PENDING', id };
  }

  @Post('debug/queue-sms')
  async queueTestSMS(@Body() body: { phone: string; entityProfileId: string }) {
    const notification = this.dbManager.manager.create(NotificationQueue, {
      type: NotificationType.BILLING_GENERATED,
      channel: NotificationChannel.SMS,
      entityProfileId: body.entityProfileId,
      recipientPhone: body.phone,
      recipientName: 'Test User',
      message: `Dear Test, your LAWMA bill for March 2026 is ₦5000. Property: Test Address. Thank you.`,
      metadata: {
        amount: 5000,
        month: 'March',
        year: '2026',
        propertyAddress: 'Test Address',
      },
      status: NotificationStatus.PENDING,
      smsUnitDeducted: false,
      retryCount: 0,
    });
    
    const saved = await this.dbManager.manager.save(notification) as NotificationQueue;
    return { message: 'SMS queued', id: saved.id, phone: body.phone };
  }

  @Post('debug/process-notifications')
  async manuallyProcessNotifications() {
    try {
      await this.notificationService.processPendingNotifications();
      return { message: 'Notification processing triggered successfully' };
    } catch (error) {
      return { message: 'Error processing notifications', error: error.message };
    }
  }

  // webhooks
  @Post('hooks')
  async handlePaystackWebhookEvents(
    @Body() eventData: PaystackWebhookEventObject,
    @Headers('x-paystack-signature') webhookSignature: string,
  ) {
    // console.log(JSON.stringify(eventData));
    await this.utilService.handleWebhookEvent({
      eventData: eventData,
      webhookSignature,
    });
  }
}
