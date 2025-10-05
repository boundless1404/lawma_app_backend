import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, MoreThan, Between } from 'typeorm';
import { AuthTokenPayload, NotificationType } from '../lib/types';
import { Billing } from '../utils-billing/entitties/billing.entity';
import { Payment } from '../utils-billing/entitties/payments.entity';
import { BillingAccount } from '../utils-billing/entitties/billingAccount.entity';
import { PropertySubscription } from '../utils-billing/entitties/propertySubscription.entity';
import { Notification } from '../utils-billing/entitties/notification.entity';
import VirtualAccountDetail from '../utils-billing/entitties/virtualAccountDetail.entity';
import VirtualAccountReceivedPayment from '../utils-billing/entitties/virtualAccountReceivedPayment.entity';
import jsPDF from 'jspdf';

@Injectable()
export class ServiceClientService {
  constructor(private dbSource: DataSource) {
    this.dbManager = this.dbSource.manager;
  }

  private dbManager: EntityManager;

  async getDashboardMetrics(user: AuthTokenPayload, year?: number) {
    // console.log('Raw user object received:', JSON.stringify(user, null, 2));

    const { propertySubscriptionId } = user;
    const selectedYear = year || new Date().getFullYear();
    const currentYear = new Date().getFullYear();

    // console.log('Getting dashboard metrics for user:', {
    //   propertySubscriptionId,
    //   selectedYear,
    //   currentYear,
    //   userType: user.type,
    // });

    if (!propertySubscriptionId) {
      // console.error('Missing propertySubscriptionId in user object:', user);

      // For testing purposes, return mock data when no propertySubscriptionId is found
      // console.warn(
      //   'Returning mock data for testing - this should not happen in production',
      // );
      return {
        currentOutstandingBill: 0,
        monthlyPaymentTotals: Array(12).fill(0),
        avgMonthlyPayment: 0,
        totalPaidThisYear: 0,
        paymentPerformance: {
          score: 0,
          rating: 'N/A',
        },
      };
    }

    // 1. Get current outstanding bill (always current year)
    const outstandingBill = await this.dbManager.findOne(Billing, {
      where: {
        propertySubscriptionId: propertySubscriptionId.toString(),
        year: currentYear.toString(),
      },
      order: { id: 'DESC' },
    });

    // console.log('Outstanding bill found:', outstandingBill);

    // 2. Get all payments for the selected year
    const payments = await this.dbManager.find(Payment, {
      where: {
        propertySubscriptionId: propertySubscriptionId.toString(),
        createdAt: Between(
          new Date(`${selectedYear}-01-01`),
          new Date(`${selectedYear}-12-31T23:59:59.999Z`),
        ),
      },
    });

    // console.log(
    //   'Payments found for selected year:',
    //   payments.length,
    //   'for propertySubscriptionId:',
    //   propertySubscriptionId,
    //   'year:',
    //   selectedYear,
    // );

    // 3. Calculate monthly payment totals
    const monthlyTotals = Array(12).fill(0);
    payments.forEach((p) => {
      const month = new Date(p.createdAt).getMonth();
      const amount = parseFloat(p.amount) || 0; // Convert string to number
      monthlyTotals[month] += amount;
      // console.log(`Payment in month ${month}: ${amount}`);
    });

    // console.log('Monthly totals calculated:', monthlyTotals);

    // 4. Calculate aggregates for selected year
    const totalPaidThisYear = payments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0,
    );
    const monthsWithPayments = monthlyTotals.filter(
      (total) => total > 0,
    ).length;
    const avgMonthlyPayment =
      monthsWithPayments > 0 ? totalPaidThisYear / monthsWithPayments : 0;

    // 5. Determine Payment Performance
    const paymentPerformance =
      this.calculatePaymentPerformance(monthsWithPayments);

    // console.log('Final calculations:', {
    //   selectedYear,
    //   totalPaidThisYear,
    //   monthsWithPayments,
    //   avgMonthlyPayment,
    //   paymentPerformance,
    // });

    return {
      currentOutstandingBill: parseFloat(outstandingBill?.amount || '0'),
      monthlyPaymentTotals: monthlyTotals,
      avgMonthlyPayment: Math.round(avgMonthlyPayment * 100) / 100, // Round to 2 decimal places
      totalPaidThisYear: Math.round(totalPaidThisYear * 100) / 100, // Round to 2 decimal places
      paymentPerformance,
      selectedYear, // Include the year for which the data was calculated
    };
  }

  private calculatePaymentPerformance(monthsPaid: number) {
    let rating = 'N/A';
    if (monthsPaid >= 10) {
      rating = 'Platinum';
    } else if (monthsPaid >= 7) {
      rating = 'Gold';
    } else if (monthsPaid >= 4) {
      rating = 'Silver';
    } else if (monthsPaid > 0) {
      rating = 'Bronze';
    }
    return {
      score: monthsPaid,
      rating,
    };
  }

  async getBilling(
    user: AuthTokenPayload,
    page = 1,
    limit = 10,
    year?: number,
    status?: 'paid' | 'unpaid' | 'overdue',
  ) {
    // console.log('Getting billing for user:', {
    //   propertySubscriptionId: user.propertySubscriptionId,
    //   page,
    //   limit,
    //   year,
    //   status,
    // });

    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      console.error('Missing propertySubscriptionId in user object:', user);
      throw new Error('Property subscription ID is required for billing data');
    }

    const offset = (page - 1) * limit;

    // Get billing account for current arrears calculation
    const billingAccount = await this.dbManager.findOne(BillingAccount, {
      where: { propertySubscriptionId: propertySubscriptionId.toString() },
    });

    // Calculate current arrears from billing account
    const currentArrears = billingAccount
      ? parseFloat(billingAccount.totalBillings) -
        parseFloat(billingAccount.totalPayments)
      : 0;

    // Get property subscription with units and profile
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: { id: propertySubscriptionId.toString() },
        relations: [
          'propertySubscriptionUnits',
          'propertySubscriptionUnits.entitySubscriberProperty',
          'propertySubscriptionUnits.entitySubscriberProperty.propertyType',
          'entitySubscriberProfile',
        ],
      },
    );

    // Build the where clause for billings
    const whereClause: any = {
      propertySubscriptionId: propertySubscriptionId.toString(),
    };

    if (year) {
      whereClause.year = year.toString();
    }

    // Get billings with pagination
    const [billings, total] = await this.dbManager.findAndCount(Billing, {
      where: whereClause,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    // Get the most recent payment for last payment info
    const lastPayment = await this.dbManager.findOne(Payment, {
      where: { propertySubscriptionId: propertySubscriptionId.toString() },
      order: { createdAt: 'DESC' },
    });

    // Process each billing record
    const processedBillings = await Promise.all(
      billings.map(async (billing) => {
        const billingAmount = parseFloat(billing.amount);

        // Fix the date range construction - billing.month might not be a number
        const monthNumber = parseInt(billing.month, 10);
        if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
          console.warn(
            `Invalid month found: ${billing.month} for billing ${billing.id}`,
          );
          // Skip payment lookup for invalid months
          return {
            id: billing.id,
            amount: billingAmount,
            month: billing.month,
            year: billing.year,
            createdAt: billing.createdAt,
            status: 'unpaid' as const,
            amountPaid: 0,
            amountDue: billingAmount,
            propertyInfo: propertySubscription
              ? {
                  propertyName: propertySubscription.propertySubscriptionName,
                  streetNumber: propertySubscription.streetNumber,
                  units:
                    propertySubscription.propertySubscriptionUnits?.length || 1,
                  unitsBreakdown:
                    propertySubscription.propertySubscriptionUnits?.map(
                      (unit) => ({
                        type:
                          unit.entitySubscriberProperty?.propertyType?.name ||
                          'Standard Property',
                        count: unit.propertyUnits,
                        rate: parseFloat(
                          unit.entitySubscriberProperty?.propertyType
                            ?.unitPrice || '0',
                        ),
                      }),
                    ) || [
                      {
                        type: 'Standard Property',
                        count: 1,
                        rate: parseFloat(billing.amount),
                      },
                    ],
                  subscriberName: `${
                    propertySubscription.entitySubscriberProfile?.firstName ||
                    ''
                  } ${
                    propertySubscription.entitySubscriberProfile?.lastName || ''
                  }`.trim(),
                  phone: propertySubscription.entitySubscriberProfile?.phone,
                  address: `${propertySubscription.streetNumber || ''} ${
                    propertySubscription.propertySubscriptionName || ''
                  }`.trim(),
                }
              : null,
            payments: [],
          };
        }

        // Create proper date range for the billing month
        const startDate = new Date(parseInt(billing.year), monthNumber - 1, 1);
        const endDate = new Date(
          parseInt(billing.year),
          monthNumber,
          0,
          23,
          59,
          59,
          999,
        );

        // Get all payments for this billing period
        const relatedPayments = await this.dbManager.find(Payment, {
          where: {
            propertySubscriptionId: propertySubscriptionId.toString(),
            createdAt: Between(startDate, endDate),
          },
        });

        const totalPaid = relatedPayments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount),
          0,
        );

        const amountDue = Math.max(0, billingAmount - totalPaid);

        // Determine status
        let billStatus: 'paid' | 'unpaid' | 'overdue' = 'unpaid';
        if (totalPaid >= billingAmount) {
          billStatus = 'paid';
        } else {
          // Check if overdue (older than current month)
          const billDate = new Date(parseInt(billing.year), monthNumber - 1, 1);
          const currentDate = new Date();
          const currentMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
          );

          if (billDate < currentMonth && amountDue > 0) {
            billStatus = 'overdue';
          }
        }

        return {
          id: billing.id,
          amount: billingAmount,
          month: billing.month,
          year: billing.year,
          createdAt: billing.createdAt,
          status: billStatus,
          amountPaid: totalPaid,
          amountDue,
          propertyInfo: propertySubscription
            ? {
                propertyName: propertySubscription.propertySubscriptionName,
                streetNumber: propertySubscription.streetNumber,
                units:
                  propertySubscription.propertySubscriptionUnits?.length || 1,
                unitsBreakdown:
                  propertySubscription.propertySubscriptionUnits?.map(
                    (unit) => ({
                      type:
                        unit.entitySubscriberProperty?.propertyType?.name ||
                        'Standard Property',
                      count: unit.propertyUnits,
                      rate: parseFloat(
                        unit.entitySubscriberProperty?.propertyType
                          ?.unitPrice || '0',
                      ),
                    }),
                  ) || [
                    {
                      type: 'Standard Property',
                      count: 1,
                      rate: parseFloat(billing.amount),
                    },
                  ],
                subscriberName: `${
                  propertySubscription.entitySubscriberProfile?.firstName || ''
                } ${
                  propertySubscription.entitySubscriberProfile?.lastName || ''
                }`.trim(),
                phone: propertySubscription.entitySubscriberProfile?.phone,
                address: `${propertySubscription.streetNumber || ''} ${
                  propertySubscription.propertySubscriptionName || ''
                }`.trim(),
              }
            : null,
          payments: relatedPayments.map((p) => ({
            id: p.id,
            amount: parseFloat(p.amount),
            paymentDate: p.paymentDate,
            payerName: p.payerName,
            createdAt: p.createdAt,
          })),
        };
      }),
    );

    // Filter by status if provided
    const filteredBillings = status
      ? processedBillings.filter((b) => b.status === status)
      : processedBillings;

    const totalFiltered = status
      ? await this.countBillingsByStatus(
          propertySubscriptionId.toString(),
          year,
          status,
        )
      : total;

    return {
      billings: filteredBillings,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit),
      },
      summary: {
        totalBills: total,
        totalPaid: processedBillings.filter((b) => b.status === 'paid').length,
        totalUnpaid: processedBillings.filter((b) => b.status === 'unpaid')
          .length,
        totalOverdue: processedBillings.filter((b) => b.status === 'overdue')
          .length,
        currentArrears, // Use billing account calculation
      },
      lastPayment: lastPayment
        ? {
            amount: parseFloat(lastPayment.amount),
            date: lastPayment.paymentDate,
            payerName: lastPayment.payerName,
          }
        : null,
    };
  }

  private async countBillingsByStatus(
    propertySubscriptionId: string,
    year?: number,
    status?: 'paid' | 'unpaid' | 'overdue',
  ): Promise<number> {
    const whereClause: any = { propertySubscriptionId };
    if (year) {
      whereClause.year = year.toString();
    }

    const billings = await this.dbManager.find(Billing, { where: whereClause });

    // For now, return all billings count
    // In a real implementation, you'd filter by status
    return billings.length;
  }

  async getPayments(
    user: AuthTokenPayload,
    page = 1,
    limit = 10,
    year?: number,
  ) {
    // console.log('Getting payments for user:', {
    //   propertySubscriptionId: user.propertySubscriptionId,
    //   page,
    //   limit,
    //   year,
    // });

    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      console.error('Missing propertySubscriptionId in user object:', user);
      throw new Error('Property subscription ID is required for payment data');
    }

    const offset = (page - 1) * limit;

    // Build the where clause
    const whereClause: any = {
      propertySubscriptionId: propertySubscriptionId.toString(),
    };

    // Filter by year if provided
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      whereClause.createdAt = Between(startDate, endDate);
    }

    // Get payments with pagination
    const [payments, total] = await this.dbManager.findAndCount(Payment, {
      where: whereClause,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    // Also get virtual account received payments
    const virtualAccountPayments = await this.dbManager.find(
      VirtualAccountReceivedPayment,
      {
        where: {
          virtualAccountDetail: {
            propertySubscriptionId: propertySubscriptionId.toString(),
          },
          ...(year && {
            createdAt: Between(
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31T23:59:59.999Z`),
            ),
          }),
        },
        relations: ['virtualAccountDetail'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      },
    );

    // Combine and format all payments
    const allPayments = [
      ...payments.map((p) => ({
        id: p.id,
        amount: parseFloat(p.amount),
        paymentDate: p.paymentDate,
        payerName: p.payerName,
        createdAt: p.createdAt,
        type: 'manual' as const,
        status: 'confirmed' as const,
        reference: null,
      })),
      ...virtualAccountPayments.map((vp) => ({
        id: vp.id,
        amount: 0, // Amount not available in current entity structure
        paymentDate: vp.createdAt.toISOString().split('T')[0],
        payerName: 'Virtual Account Payment',
        createdAt: vp.createdAt,
        type: 'virtual_account' as const,
        status: 'confirmed' as const,
        reference: vp.paymentReference,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const totalPayments = total + virtualAccountPayments.length;

    return {
      payments: allPayments.slice(0, limit),
      pagination: {
        page,
        limit,
        total: totalPayments,
        totalPages: Math.ceil(totalPayments / limit),
      },
    };
  }

  async getVirtualAccount(user: AuthTokenPayload) {
    // console.log(
    //   'Getting virtual account for user:',
    //   user.propertySubscriptionId,
    // );

    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      console.error('Missing propertySubscriptionId in user object:', user);
      throw new Error(
        'Property subscription ID is required for virtual account',
      );
    }

    // Get virtual account details
    const virtualAccount = await this.dbManager.findOne(VirtualAccountDetail, {
      where: {
        propertySubscriptionId: propertySubscriptionId.toString(),
      },
    });

    if (!virtualAccount) {
      throw new Error('Virtual account not found for this user');
    }

    return {
      accountNumber: virtualAccount.account_number,
      accountName: virtualAccount.account_name,
      bankName: virtualAccount.bank,
      email: virtualAccount.email,
    };
  }

  // Payment proof method - DISABLED
  /*
  async createPaymentProof(
    user: AuthTokenPayload,
    proofData: {
      amount: number;
      paymentDate: string;
      payerName: string;
      comments?: string;
      bankName: string;
      proofOfPaymentUrl?: string;
    },
  ) {
    console.log(
      'Creating payment proof for user:',
      user.propertySubscriptionId,
    );

    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      console.error('Missing propertySubscriptionId in user object:', user);
      throw new Error('Property subscription ID is required for payment proof');
    }

    // Create a new payment record
    const payment = this.dbManager.create(Payment, {
      propertySubscriptionId: propertySubscriptionId.toString(),
      amount: proofData.amount.toString(),
      paymentDate: proofData.paymentDate,
      payerName: proofData.payerName,
      comments: proofData.comments || `Bank payment via ${proofData.bankName}`,
    });

    const savedPayment = await this.dbManager.save(Payment, payment);

    return {
      id: savedPayment.id,
      amount: parseFloat(savedPayment.amount),
      paymentDate: savedPayment.paymentDate,
      payerName: savedPayment.payerName,
      comments: savedPayment.comments,
      status: 'pending_verification',
      createdAt: savedPayment.createdAt,
    };
  }
  */

  async generateBillHTML(
    user: AuthTokenPayload,
    billId: string,
  ): Promise<string> {
    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      throw new Error('Property subscription ID is required');
    }

    // Get the specific bill
    const billing = await this.dbManager.findOne(Billing, {
      where: {
        id: billId,
        propertySubscriptionId: propertySubscriptionId.toString(),
      },
    });

    if (!billing) {
      throw new Error('Bill not found');
    }

    // Get property subscription details
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: { id: propertySubscriptionId.toString() },
        relations: [
          'propertySubscriptionUnits',
          'propertySubscriptionUnits.entitySubscriberProperty',
          'propertySubscriptionUnits.entitySubscriberProperty.propertyType',
          'entitySubscriberProfile',
        ],
      },
    );

    // Get billing account for arrears
    const billingAccount = await this.dbManager.findOne(BillingAccount, {
      where: { propertySubscriptionId: propertySubscriptionId.toString() },
    });

    const currentArrears = billingAccount
      ? parseFloat(billingAccount.totalBillings) -
        parseFloat(billingAccount.totalPayments)
      : 0;

    // Get last payment
    const lastPayment = await this.dbManager.findOne(Payment, {
      where: { propertySubscriptionId: propertySubscriptionId.toString() },
      order: { createdAt: 'DESC' },
    });

    // Get virtual account details
    const virtualAccount = await this.dbManager.findOne(VirtualAccountDetail, {
      where: { propertySubscriptionId: propertySubscriptionId.toString() },
    });

    // Get payments for this specific billing period
    const monthNumber = parseInt(billing.month, 10);
    let relatedPayments: any[] = [];
    let totalPaid = 0;

    // Validate month and year values
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      console.warn(
        `Invalid month found: ${billing.month} for billing ${billing.id}`,
      );
      // Use empty payments for invalid dates
      relatedPayments = [];
      totalPaid = 0;
    } else {
      // Create proper date range for the billing month
      const startDate = new Date(parseInt(billing.year), monthNumber - 1, 1);
      const endDate = new Date(
        parseInt(billing.year),
        monthNumber,
        0,
        23,
        59,
        59,
        999,
      );

      relatedPayments = await this.dbManager.find(Payment, {
        where: {
          propertySubscriptionId: propertySubscriptionId.toString(),
          createdAt: Between(startDate, endDate),
        },
      });

      totalPaid = relatedPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0,
      );
    }

    // Build bill data using existing entity fields
    const billData = {
      id: billing.id,
      propertySubscriptionId: propertySubscriptionId.toString(),
      amount: parseFloat(billing.amount),
      month: billing.month,
      year: billing.year,
      currentArrears,
      totalPaid,
      lastPayment: lastPayment
        ? {
            amount: parseFloat(lastPayment.amount),
            date: lastPayment.paymentDate,
            payerName: lastPayment.payerName,
          }
        : null,
      propertyInfo: propertySubscription
        ? {
            propertyName: propertySubscription.propertySubscriptionName,
            streetNumber: propertySubscription.streetNumber,
            units: propertySubscription.propertySubscriptionUnits?.length || 1,
            unitsBreakdown: propertySubscription.propertySubscriptionUnits?.map(
              (unit) => ({
                type:
                  unit.entitySubscriberProperty?.propertyType?.name ||
                  'Standard Property',
                count: unit.propertyUnits,
                rate: parseFloat(
                  unit.entitySubscriberProperty?.propertyType?.unitPrice || '0',
                ),
              }),
            ) || [
              {
                type: 'Standard Property',
                count: 1,
                rate: parseFloat(billing.amount),
              },
            ],
            subscriberName: `${
              propertySubscription.entitySubscriberProfile?.firstName || ''
            } ${
              propertySubscription.entitySubscriberProfile?.lastName || ''
            }`.trim(),
            phone: propertySubscription.entitySubscriberProfile?.phone,
            address: `${propertySubscription.streetNumber || ''} ${
              propertySubscription.propertySubscriptionName || ''
            }`.trim(),
          }
        : null,
      payments: relatedPayments,
      virtualAccount: virtualAccount
        ? {
            accountNumber: virtualAccount.account_number,
            accountName: virtualAccount.account_name,
            bankName: virtualAccount.bank,
          }
        : null,
    };

    return this.generateHTMLTemplate(billData);
  }

  async generateBillPDF(
    user: AuthTokenPayload,
    billId: string,
  ): Promise<Buffer> {
    try {
      // Get bill data for PDF generation
      const billData = await this.getBillDataForPDF(user, billId);

      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header Section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('LAGOS STATE GOVERNMENT', pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 8;

      doc.setFontSize(14);
      doc.text(
        'Lagos Waste Management Authority (LAWMA)',
        pageWidth / 2,
        yPosition,
        { align: 'center' },
      );
      yPosition += 15;

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('WASTE MANAGEMENT BILL', pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 5;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Issued by: Golden Rising Sun', pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 20;

      // Bill Details Section
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('BILL DETAILS', 20, yPosition);
      yPosition += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      // Left column
      const leftCol = 20;
      const rightCol = 120;

      doc.text(
        `Bill Reference: GRS-${user.propertySubscriptionId}`,
        leftCol,
        yPosition,
      );
      doc.text(`Bill Date: ${billData.billDate}`, rightCol, yPosition);
      yPosition += 6;

      doc.text(
        `Billing Reference: Billing-${billData.billId}`,
        leftCol,
        yPosition,
      );
      doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        rightCol,
        yPosition,
      );
      yPosition += 15;

      // Customer Details Section with Virtual Account beside it
      const billToStartY = yPosition;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('BILL TO', leftCol, yPosition);
      yPosition += 8;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(billData.accountName, leftCol, yPosition);
      yPosition += 6;
      doc.text(billData.propertyAddress, leftCol, yPosition);
      yPosition += 6;
      if (billData.phone && billData.phone !== 'N/A') {
        doc.text(billData.phone, leftCol, yPosition);
        yPosition += 6;
      }

      // Virtual Account Details Section (positioned to the right of BILL TO)
      if (billData.virtualAccount) {
        const virtualAccountStartY = billToStartY;
        const virtualAccountLeftCol = rightCol;

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(
          'PAYMENT ACCOUNT',
          virtualAccountLeftCol,
          virtualAccountStartY,
        );

        // Virtual account box - increased height for two-line account name
        const boxHeight = 28;
        const boxWidth = pageWidth - virtualAccountLeftCol - 20;
        doc.rect(
          virtualAccountLeftCol,
          virtualAccountStartY + 5,
          boxWidth,
          boxHeight,
        );

        let virtualAccountY = virtualAccountStartY + 13;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(
          `Account: ${billData.virtualAccount.accountNumber}`,
          virtualAccountLeftCol + 3,
          virtualAccountY,
        );
        virtualAccountY += 4;

        // Split account name into two lines for better formatting
        const accountName = billData.virtualAccount.accountName;
        const maxWidth = boxWidth - 6; // Leave some padding
        const words = accountName.split(' ');

        if (words.length > 2) {
          // Split into two lines
          const midPoint = Math.ceil(words.length / 2);
          const firstLine = words.slice(0, midPoint).join(' ');
          const secondLine = words.slice(midPoint).join(' ');

          doc.text(
            `Name: ${firstLine}`,
            virtualAccountLeftCol + 3,
            virtualAccountY,
          );
          virtualAccountY += 4;
          doc.text(`${secondLine}`, virtualAccountLeftCol + 9, virtualAccountY);
          virtualAccountY += 4;
        } else {
          // Keep on one line if short
          doc.text(
            `Name: ${accountName}`,
            virtualAccountLeftCol + 3,
            virtualAccountY,
          );
          virtualAccountY += 4;
        }

        doc.text(
          `Bank: ${billData.virtualAccount.bankName}`,
          virtualAccountLeftCol + 3,
          virtualAccountY,
        );
      }

      yPosition += 10;

      // Property Units Details Section
      if (billData.propertyUnits && billData.propertyUnits.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('PROPERTY UNITS BREAKDOWN', leftCol, yPosition);
        yPosition += 10;

        // Table headers
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Property Type', leftCol, yPosition);
        doc.text('Units', leftCol + 60, yPosition);
        doc.text('Rate (N)', leftCol + 90, yPosition);
        doc.text('Amount (N)', leftCol + 130, yPosition);
        yPosition += 3;

        // Draw line under headers
        doc.line(leftCol, yPosition, pageWidth - 20, yPosition);
        yPosition += 6;

        // Property units details
        doc.setFont(undefined, 'normal');
        billData.propertyUnits.forEach((unit: any) => {
          const unitAmount = unit.count * unit.rate;
          doc.text(unit.type, leftCol, yPosition);
          doc.text(unit.count.toString(), leftCol + 60, yPosition);
          doc.text(unit.rate.toLocaleString(), leftCol + 90, yPosition);
          doc.text(unitAmount.toLocaleString(), leftCol + 130, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      // Billing Summary Table
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('BILLING SUMMARY', leftCol, yPosition);
      yPosition += 10;

      // Table headers - Use simple text to avoid encoding issues
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Description', leftCol, yPosition);
      doc.text('Amount (N)', rightCol + 40, yPosition);
      yPosition += 2;

      // Draw line under headers
      doc.line(leftCol, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      // Table content
      doc.setFont(undefined, 'normal');
      doc.text('Current Month Charges', leftCol, yPosition);
      doc.text(
        parseFloat(billData.currentCharges).toLocaleString(),
        rightCol + 40,
        yPosition,
      );
      yPosition += 6;

      doc.text('Previous Balance', leftCol, yPosition);
      doc.text(
        parseFloat(billData.previousBalance).toLocaleString(),
        rightCol + 40,
        yPosition,
      );
      yPosition += 8;

      // Draw line before total
      doc.line(leftCol, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      // Total - Use simple formatting to avoid encoding issues
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL AMOUNT DUE', leftCol, yPosition);
      doc.text(
        `N${parseFloat(billData.totalAmount).toLocaleString()}`,
        rightCol + 40,
        yPosition,
      );
      yPosition += 20;

      // Last Payment Section
      if (billData.lastPayment) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('LAST PAYMENT', leftCol, yPosition);
        yPosition += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(
          `Amount: N${parseFloat(
            billData.lastPayment.amount,
          ).toLocaleString()}`,
          leftCol,
          yPosition,
        );
        yPosition += 6;
        doc.text(`Date: ${billData.lastPayment.date}`, leftCol, yPosition);
        yPosition += 6;
        doc.text(
          `Payer: ${billData.lastPayment.payerName}`,
          leftCol,
          yPosition,
        );
        yPosition += 15;
      }

      // Footer
      doc.setFontSize(8);
      doc.text(
        'This bill is issued by Golden Rising Sun on behalf of the Lagos State Government',
        leftCol,
        pageHeight - 30,
      );
      doc.text(
        'by Virtue of Section 18 of the Lagos Waste Management Authority Law No. 127 Vol. 40,',
        leftCol,
        pageHeight - 26,
      );
      doc.text(
        'Law of Lagos State 2007. Failure to pay attracts penalties as prescribed by law.',
        leftCol,
        pageHeight - 22,
      );

      doc.text(
        'Enquiries: 08052323309, 08095323309, 08082562771',
        leftCol,
        pageHeight - 15,
      );
      doc.text(
        'LAWMA Response Center (LRC): 07080601020',
        leftCol,
        pageHeight - 11,
      );

      // Convert to buffer
      const pdfOutput = doc.output('arraybuffer');
      return Buffer.from(pdfOutput);
    } catch (error) {
      console.error('Error generating bill PDF:', error);
      throw new Error(`Failed to generate bill PDF: ${error.message}`);
    }
  }

  private async getBillDataForPDF(
    user: AuthTokenPayload,
    billId: string,
  ): Promise<any> {
    try {
      // Get the billing data using the same approach as generateBillHTML
      const { propertySubscriptionId } = user;

      if (!propertySubscriptionId) {
        throw new Error('Property subscription ID is required');
      }

      // Get the specific bill
      const billing = await this.dbManager.findOne(Billing, {
        where: {
          id: billId,
          propertySubscriptionId: propertySubscriptionId.toString(),
        },
      });

      if (!billing) {
        throw new Error('Bill not found');
      }

      // Get property subscription details with units
      const propertySubscription = await this.dbManager.findOne(
        PropertySubscription,
        {
          where: { id: propertySubscriptionId.toString() },
          relations: [
            'entitySubscriberProfile',
            'propertySubscriptionUnits',
            'propertySubscriptionUnits.entitySubscriberProperty',
            'propertySubscriptionUnits.entitySubscriberProperty.propertyType',
          ],
        },
      );

      // Get billing account for arrears
      const billingAccount = await this.dbManager.findOne(BillingAccount, {
        where: { propertySubscriptionId: propertySubscriptionId.toString() },
      });

      const currentArrears = billingAccount
        ? parseFloat(billingAccount.totalBillings) -
          parseFloat(billingAccount.totalPayments)
        : 0;

      // Get last payment
      const lastPayment = await this.dbManager.findOne(Payment, {
        where: { propertySubscriptionId: propertySubscriptionId.toString() },
        order: { createdAt: 'DESC' },
      });

      // Get virtual account details
      const virtualAccount = await this.dbManager.findOne(
        VirtualAccountDetail,
        {
          where: { propertySubscriptionId: propertySubscriptionId.toString() },
        },
      );

      // Format month name
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthNumber = parseInt(billing.month, 10);
      const monthName = monthNames[monthNumber - 1] || billing.month;

      // Build property units breakdown
      const propertyUnits =
        propertySubscription?.propertySubscriptionUnits?.map((unit) => ({
          type:
            unit.entitySubscriberProperty?.propertyType?.name ||
            'Standard Property',
          count: unit.propertyUnits,
          rate: parseFloat(
            unit.entitySubscriberProperty?.propertyType?.unitPrice || '0',
          ),
        })) || [
          {
            type: 'Standard Property',
            count: 1,
            rate: parseFloat(billing.amount),
          },
        ];

      const billDataResult = {
        billId: billing.id,
        accountName: propertySubscription?.entitySubscriberProfile
          ? `${propertySubscription.entitySubscriberProfile.firstName || ''} ${
              propertySubscription.entitySubscriberProfile.lastName || ''
            }`.trim()
          : 'N/A',
        propertyAddress:
          `${propertySubscription?.streetNumber || ''} ${
            propertySubscription?.propertySubscriptionName || ''
          }`.trim() || 'N/A',
        billDate: `${monthName} ${billing.year}`,
        dueDate: 'End of Month',
        currentCharges: parseFloat(billing.amount).toFixed(2),
        previousBalance: Math.max(
          0,
          currentArrears - parseFloat(billing.amount),
        ).toFixed(2),
        totalAmount: (
          parseFloat(billing.amount) +
          Math.max(0, currentArrears - parseFloat(billing.amount))
        ).toFixed(2),
        phone: propertySubscription?.entitySubscriberProfile?.phone || 'N/A',
        propertyUnits,
        lastPayment: lastPayment
          ? {
              amount: parseFloat(lastPayment.amount).toFixed(2),
              date: lastPayment.paymentDate,
              payerName: lastPayment.payerName,
            }
          : null,
        virtualAccount: virtualAccount
          ? {
              accountNumber: virtualAccount.account_number,
              accountName: virtualAccount.account_name,
              bankName: virtualAccount.bank,
            }
          : null,
      };

      return billDataResult;
    } catch (error) {
      console.error('Error getting bill data for PDF:', error);
      // Return default data if there's an error
      return {
        billId: billId,
        accountName: 'N/A',
        propertyAddress: 'N/A',
        billDate: new Date().toLocaleDateString(),
        dueDate: 'N/A',
        currentCharges: '0.00',
        previousBalance: '0.00',
        totalAmount: '0.00',
        phone: 'N/A',
        propertyUnits: [],
        lastPayment: null,
        virtualAccount: null,
      };
    }
  }

  private generateHTMLTemplate(billData: any): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const billMonth =
      monthNames[parseInt(billData.month) - 1] || billData.month;
    const currentDate = new Date().toLocaleDateString('en-GB');
    const totalDue = billData.amount + billData.currentArrears;
    const lastPaymentAmount = billData.lastPayment?.amount || 0;

    // Generate units breakdown rows
    const unitsRows =
      billData.propertyInfo?.unitsBreakdown
        ?.map(
          (unit: any) => `
      <tr class="border-b border-gray-100">
          <td class="py-3 px-4">${unit.type}</td>
          <td class="text-center py-3 px-4">${unit.count}</td>
          <td class="text-right py-3 px-4">${unit.rate.toLocaleString()}</td>
      </tr>
    `,
        )
        .join('') ||
      `
      <tr class="border-b border-gray-100">
          <td class="py-3 px-4">Standard Property</td>
          <td class="text-center py-3 px-4">${
            billData.propertyInfo?.units || 1
          }</td>
          <td class="text-right py-3 px-4">${billData.amount.toLocaleString()}</td>
      </tr>
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waste Management Bill - ${billMonth} ${billData.year}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .watermarked-container {
            position: relative;
            background-color: #fff;
        }

        .watermarked-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            background-repeat: repeat;
            background-image: url("data:image/svg+xml,%3Csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' style='font: bold 30px &quot;Inter&quot;, sans-serif; fill: rgba(0,0,0,0.04);' transform='rotate(-45, 125, 125)'%3ELAWMA%3C/text%3E%3C/svg%3E");
        }

        @media print {
          /* Print-specific optimizations for single page */
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .watermarked-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .print-bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
           
          .print-text-red-700 {
            color: #b91c1c !important;
          }
          
          .watermarked-container::before {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            display: block !important;
          }
          
          /* Prevent page breaks in critical sections */
          .bill-header, .bill-details-section, .billing-table {
            page-break-inside: avoid !important;
          }
          
          .customer-info {
            page-break-inside: avoid !important;
          }
          
          /* Reduce spacing for print */
          .print-compact {
            padding: 12px !important;
            margin-bottom: 16px !important;
          }
          
          .print-compact-header {
            padding: 16px !important;
          }
          
          .print-compact-title {
            margin-bottom: 16px !important;
          }
          
          .print-compact-table {
            margin-bottom: 16px !important;
          }
          
          .print-compact-summary {
            margin-bottom: 16px !important;
          }
          
          .print-compact-payment {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          
          .print-compact-footer {
            padding: 12px !important;
            margin-top: 16px !important;
          }
          
          /* Smaller virtual account section for print */
          .print-virtual-account {
            padding: 12px !important;
          }
          
          .print-virtual-account h4 {
            font-size: 14px !important;
            margin-bottom: 8px !important;
          }
          
          .print-virtual-account .space-y-2 > div {
            margin-bottom: 4px !important;
          }
          
          .print-virtual-account .text-xl {
            font-size: 16px !important;
          }
        }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">

    <div class="w-full max-w-4xl shadow-2xl rounded-lg mx-auto my-8 overflow-hidden watermarked-container">
        <div class="relative z-20">
            <!-- Header Section -->
            <div class="p-6 print-compact-header flex justify-between items-center border-b-2 border-gray-100 bill-header">
                <!-- Lagos State Logo -->
                <img src="https://boundlessobs.s3.eu-north-1.amazonaws.com/lagos-state-logo.jpg" alt="Lagos State Logo" class="w-16 h-16 object-contain">

                <!-- Center Text -->
                <div class="text-center px-4">
                    <h1 class="text-lg sm:text-xl font-bold tracking-wider text-gray-800 uppercase">Lagos State Government</h1>
                    <p class="text-sm sm:text-base text-gray-600">Lagos Waste Management Authority (LAWMA)</p>
                </div>

                <!-- LAWMA Logo -->
                <img src="https://boundlessobs.s3.eu-north-1.amazonaws.com/lawma-logo.jpg" alt="LAWMA Logo" class="w-16 h-16 object-contain">
            </div>

            <div class="p-8 md:p-12 print-compact">
                <!-- Bill Title -->
                <div class="text-center mb-10 print-compact-title">
                    <h2 class="text-3xl font-bold text-red-700 print-text-red-700">Waste Management Bill</h2>
                    <p class="text-gray-500 mt-1">Issued by: Golden Rising Sun</p>
                </div>

                <!-- Bill and Customer Info -->
                <div class="grid md:grid-cols-2 gap-8 mb-10 print-compact customer-info bill-details-section">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Bill To</h3>
                        <p class="text-gray-600">${
                          billData.propertyInfo?.subscriberName || 'N/A'
                        }</p>
                        <p class="text-gray-600">${
                          billData.propertyInfo?.address || 'N/A'
                        }</p>
                        <p class="text-gray-600">${
                          billData.propertyInfo?.phone || ''
                        }</p>
                    </div>
                    <div class="text-left md:text-right">
                        <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Bill Details</h3>
                        <p class="text-gray-600"><span class="font-semibold">Bill Reference:</span> GRS-${
                          billData.propertySubscriptionId
                        }</p>
                        <p class="text-gray-600"><span class="font-semibold">Billing Reference:</span> Billing-${
                          billData.id
                        }</p>
                        <p class="text-gray-600"><span class="font-semibold">Bill Date:</span> ${billMonth} ${
      billData.year
    }</p>
                        <p class="text-gray-600"><span class="font-semibold">Generated:</span> ${currentDate}</p>
                    </div>
                </div>

                <!-- Billing Details Table -->
                <div class="mb-10 print-compact-table billing-table">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Billing Details</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-100 print-bg-gray-100">
                                <tr>
                                    <th class="text-left py-3 px-4 font-semibold text-gray-600 rounded-l-lg">Property Type</th>
                                    <th class="text-center py-3 px-4 font-semibold text-gray-600">Units</th>
                                    <th class="text-right py-3 px-4 font-semibold text-gray-600 rounded-r-lg">Amount (NGN)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${unitsRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Summary Section -->
                <div class="flex justify-end mb-12 print-compact-summary">
                    <div class="w-full md:w-2/3 lg:w-1/2">
                        <div class="flex justify-between py-2 text-gray-600">
                            <span>Current Charges</span>
                            <span>₦ ${billData.amount.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between py-2 text-gray-600">
                            <span>Arrears</span>
                            <span>₦ ${billData.currentArrears.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between py-2 text-gray-600 border-b-2">
                            <span>Last Payment</span>
                            <span>₦ ${lastPaymentAmount.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between py-4 font-bold text-xl text-red-700 print-text-red-700">
                            <span>TOTAL DUE</span>
                            <span>₦ ${totalDue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="bg-gray-50 print-bg-gray-100 p-6 print-compact-payment rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">How to Pay</h3>
                    <p class="text-gray-600 mb-4">Please make payments to your dedicated virtual account</p>
                    ${
                      billData.virtualAccount
                        ? `
                    <div class="bg-white p-6 print-virtual-account rounded-lg border border-gray-300 text-center">
                        <h4 class="text-lg font-semibold text-gray-800 mb-2">Virtual Account Details</h4>
                        <div class="space-y-2">
                            <div>
                                <span class="text-sm text-gray-600">Account Number:</span>
                                <div class="text-xl font-bold text-blue-600">${billData.virtualAccount.accountNumber}</div>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">Account Name:</span>
                                <div class="font-semibold text-gray-800">${billData.virtualAccount.accountName}</div>
                            </div>
                            <div>
                                <span class="text-sm text-gray-600">Bank:</span>
                                <div class="font-semibold text-gray-700">${billData.virtualAccount.bankName}</div>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-4">Use this account for all your waste management bill payments</p>
                    </div>
                    `
                        : `
                    <div class="grid sm:grid-cols-3 gap-2 text-center">
                        <div class="bg-white p-3 rounded-lg border">
                            <p class="font-semibold text-gray-700 text-sm">First Bank</p>
                            <p class="text-gray-500 text-sm">2012669553</p>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                            <p class="font-semibold text-gray-700 text-sm">Sterling Bank</p>
                            <p class="text-gray-500 text-sm">0047185505</p>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                            <p class="font-semibold text-gray-700 text-sm">Access Bank</p>
                            <p class="text-gray-500 text-sm">(Not Listed)</p>
                        </div>
                    </div>
                    `
                    }
                </div>
            </div>

            <!-- Footer -->
            <footer class="text-xs text-gray-500 text-center p-6 print-compact-footer border-t mt-8">
                <p class="mb-2">This bill is issued by Golden Rising Sun on behalf of the Lagos State Government by Virtue of Section 18 of the Lagos Waste Management Authority Law No. 127 Vol. 40, Law of Lagos State 2007. Any person who fails or neglects to pay the bill(s) or charges presented by the Lagos Waste Management Authority commits an offence and is liable to conviction to a fine or imprisonment.</p>
                <p><strong>Enquiries:</strong> 08052323309, 08095323309, 08082562771 | <strong>LAWMA Response Center (LRC):</strong> 07080601020</p>
            </footer>
        </div>
    </div>

</body>
</html>
  `;
  }

  // Notification Methods
  async getNotifications(
    user: AuthTokenPayload,
    page = 1,
    limit = 10,
    filter?: 'all' | 'unread' | 'alerts',
  ) {
    // console.log('Getting notifications for user:', {
    //   propertySubscriptionId: user.propertySubscriptionId,
    //   page,
    //   limit,
    //   filter,
    // });

    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      console.error('Missing propertySubscriptionId in user object:', user);
      throw new Error('Property subscription ID is required for notifications');
    }

    const offset = (page - 1) * limit;

    // Build the where clause
    const whereClause: any = {
      propertySubscriptionId: propertySubscriptionId.toString(),
    };

    // Apply filters
    if (filter === 'unread') {
      whereClause.isRead = false;
    } else if (filter === 'alerts') {
      whereClause.type = 'alert';
    }

    // Get notifications with pagination
    const [notifications, total] = await this.dbManager.findAndCount(
      Notification,
      {
        where: whereClause,
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      },
    );

    // Get unread count
    const unreadCount = await this.dbManager.count(Notification, {
      where: {
        propertySubscriptionId: propertySubscriptionId.toString(),
        isRead: false,
      },
    });

    return {
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        description: notification.description,
        type: notification.type,
        isRead: notification.isRead,
        actionText: notification.actionText,
        actionUrl: notification.actionUrl,
        imageUrl: notification.imageUrl,
        relatedEntityId: notification.relatedEntityId,
        relatedEntityType: notification.relatedEntityType,
        createdAt: notification.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markNotificationAsRead(
    user: AuthTokenPayload,
    notificationId: string,
  ): Promise<boolean> {
    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      throw new Error('Property subscription ID is required');
    }

    const result = await this.dbManager.update(
      Notification,
      {
        id: notificationId,
        propertySubscriptionId: propertySubscriptionId.toString(),
      },
      { isRead: true },
    );

    return result.affected > 0;
  }

  async markAllNotificationsAsRead(user: AuthTokenPayload): Promise<number> {
    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      throw new Error('Property subscription ID is required');
    }

    const result = await this.dbManager.update(
      Notification,
      {
        propertySubscriptionId: propertySubscriptionId.toString(),
        isRead: false,
      },
      { isRead: true },
    );

    return result.affected || 0;
  }

  async deleteNotification(
    user: AuthTokenPayload,
    notificationId: string,
  ): Promise<boolean> {
    const { propertySubscriptionId } = user;

    if (!propertySubscriptionId) {
      throw new Error('Property subscription ID is required');
    }

    const result = await this.dbManager.delete(Notification, {
      id: notificationId,
      propertySubscriptionId: propertySubscriptionId.toString(),
    });

    return result.affected > 0;
  }

  // Helper method to create notifications (for internal use)
  async createNotification(data: {
    title: string;
    description: string;
    type: NotificationType;
    propertySubscriptionId: string;
    actionText?: string;
    actionUrl?: string;
    imageUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<Notification> {
    const notification = this.dbManager.create(Notification, {
      ...data,
      isRead: false,
    });
    return await this.dbManager.save(notification);
  }
}
