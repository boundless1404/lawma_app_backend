import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Body,
  Param,
  Req,
  Res,
  Delete,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ServiceClientService } from './service-client.service';
import { AuthTokenPayload } from '../lib/types';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { Response } from 'express';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';

@Controller('service-client')
@UseGuards(IsAuthenticated)
export class ServiceClientController {
  constructor(private readonly serviceClientService: ServiceClientService) {}

  @Get('dashboard-metrics')
  getDashboardMetrics(
    @GetAuthPayload() user: AuthTokenPayload,
    @Query('year') year?: string,
  ) {
    // A guard should ensure that user.type is 'serviced-client'
    // or we can check it here.
    const selectedYear = year ? parseInt(year, 10) : undefined;
    return this.serviceClientService.getDashboardMetrics(user, selectedYear);
  }

  @Get('billing')
  getBilling(
    @GetAuthPayload() user: AuthTokenPayload,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('year') year?: string,
    @Query('status') status?: 'paid' | 'unpaid' | 'overdue',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const selectedYear = year ? parseInt(year, 10) : undefined;
    return this.serviceClientService.getBilling(
      user,
      pageNum,
      limitNum,
      selectedYear,
      status,
    );
  }

  @Get('payments')
  getPayments(
    @GetAuthPayload() user: AuthTokenPayload,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('year') year?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const selectedYear = year ? parseInt(year, 10) : undefined;
    return this.serviceClientService.getPayments(
      user,
      pageNum,
      limitNum,
      selectedYear,
    );
  }

  @Get('virtual-account')
  getVirtualAccount(@GetAuthPayload() user: AuthTokenPayload) {
    return this.serviceClientService.getVirtualAccount(user);
  }

  // Payment proof endpoint - DISABLED
  /*
  @Post('payments/proof')
  createPaymentProof(
    @GetAuthPayload() user: AuthTokenPayload,
    @Body()
    paymentProofData: {
      amount: number;
      paymentDate: string;
      payerName: string;
      comments?: string;
      bankName: string;
      proofOfPaymentUrl?: string;
    },
  ) {
    return this.serviceClientService.createPaymentProof(user, paymentProofData);
  }
  */

  @Get('billing/:id/download')
  async downloadBill(
    @Param('id') billId: string,
    @GetAuthPayload() user: AuthTokenPayload,
    @Res() res: Response, // Use Express Response type
  ) {
    try {
      const htmlContent = await this.serviceClientService.generateBillHTML(
        user,
        billId,
      );

      // Now these methods will work correctly
      res.setHeader('Content-Type', 'text/html');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="bill-${billId}.html"`,
      );
      res.send(htmlContent);
    } catch (error) {
      console.error('Error generating bill HTML:', error);
      if (error instanceof Error && error.message === 'Bill not found') {
        throw new NotFoundException('Bill not found');
      }
      throw new InternalServerErrorException('Failed to generate bill HTML');
    }
  }

  // Notification Endpoints
  @Get('notifications')
  async getNotifications(
    @GetAuthPayload() user: AuthTokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: 'all' | 'unread' | 'alerts',
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      return await this.serviceClientService.getNotifications(
        user,
        pageNum,
        limitNum,
        filter,
      );
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new InternalServerErrorException('Failed to get notifications');
    }
  }

  @Post('notifications/:id/read')
  async markNotificationAsRead(
    @GetAuthPayload() user: AuthTokenPayload,
    @Param('id') notificationId: string,
  ) {
    try {
      const success = await this.serviceClientService.markNotificationAsRead(
        user,
        notificationId,
      );

      if (!success) {
        throw new NotFoundException('Notification not found');
      }

      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to mark notification as read',
      );
    }
  }

  @Post('notifications/read-all')
  async markAllNotificationsAsRead(@GetAuthPayload() user: AuthTokenPayload) {
    try {
      const affectedCount =
        await this.serviceClientService.markAllNotificationsAsRead(user);

      return {
        success: true,
        message: `${affectedCount} notifications marked as read`,
        affectedCount,
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new InternalServerErrorException(
        'Failed to mark all notifications as read',
      );
    }
  }

  @Delete('notifications/:id')
  async deleteNotification(
    @GetAuthPayload() user: AuthTokenPayload,
    @Param('id') notificationId: string,
  ) {
    try {
      const success = await this.serviceClientService.deleteNotification(
        user,
        notificationId,
      );

      if (!success) {
        throw new NotFoundException('Notification not found');
      }

      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }
}
