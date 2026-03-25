import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOperator,
  ILike,
  IsNull,
  Raw,
} from 'typeorm';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreatePropertyTypesDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
  GenerateBillingDto,
  GetBillingQuery,
  PostPaymentDto,
  SavePropertyUnitsDto,
  SavePropertyUnitsDetailsDto,
} from './dtos/dto';
import {
  ProfileTypes,
  SubscriberProfileRoleEnum,
  Wallet_Service_Transaction_Type,
} from '../lib/enums';
import {
  throwBadRequest,
  throwForbidden,
  throwServerError,
} from '../utils/helpers';
import { EntitySubscriberProfile } from './entitties/entitySubscriberProfile.entity';
import { EntityUserProfile } from './entitties/entityUserProfile.entity';
import {
  AuthTokenPayload,
  AuthenticatedUserData,
  PaystackWebhookData,
  PaystackWebhookEventObject,
  SingleStepDVAUserData,
} from '../lib/types';
import { Street } from './entitties/street.entity';
import { PropertyType } from './entitties/propertyTypes.entity';
import { PropertySubscription } from './entitties/propertySubscription.entity';
import { EntitySubscriberProperty } from './entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from './entitties/billingAccount.entity';
import { Billing } from './entitties/billing.entity';
import { MonthNames, sucessHttpCodes } from '../lib/projectConstants';
import { bignumber } from 'mathjs';
import { LgaWard } from './entitties/lgaWard.entity';
import { Lga } from './entitties/lga.entity';
import { Payment } from './entitties/payments.entity';
import { EntityProfile } from './entitties/entityProfile.entity';
import { RequestService } from '../shared/request/request.service';
import { ProfileCollection } from './entitties/profileCollection.entity';
import { PhoneCode } from './entitties/phoneCode.entity';
import { pick } from 'lodash';
import { isNumberString } from 'class-validator';
import ArrearsUpdate from './entitties/arrearsUpdates.entity';
import { PaystackServiceService } from '../shared/paystack_service/paystack_service.service';
import VirtualAccountDetail from './entitties/virtualAccountDetail.entity';
import WalletReference from './entitties/walletReference.entity';
import { WalletServiceService } from '../shared/wallet-service/wallet-service.service';
import { ConfigService } from '@nestjs/config';
import EntityProfileBankAccountDetails from './entitties/entityProfileBankAcountDetails.entity';
import VirtualAccountReceivedPayment from './entitties/virtualAccountReceivedPayment.entity';
import { v4 } from 'uuid';
import PendingWalletTransaction from './entitties/pendingWalletTransaction.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  getCurrentMonth,
  getCurrentYear,
} from '../utils/functions/billing.function';
import {
  formatAmount,
  generateBillingSmsMessage,
  paymentReceivedOperator,
  paymentReceivedSubscriber,
  transferSuccessfulOperator,
} from '../utils/functions/smsLayout.function';
import { SharedService } from '../shared/shared.service';
import { NotificationService } from '../shared/notification.service';

@Injectable()
export class UtilsBillingService {
  private readonly logger = new Logger(UtilsBillingService.name);

  constructor(
    private requestService: RequestService,
    public dbManager: EntityManager,
    public paystackService: PaystackServiceService,
    public walletService: WalletServiceService,
    private configService: ConfigService,
    private readonly sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private dataSource?: DataSource,
  ) {
    //
    if (!dbManager) {
      if (!dataSource) {
        throw new Error('No data source found');
      }
      this.dbManager = dataSource.manager;
      this.dataSource = dataSource;
    } else {
      this.dbManager = dbManager;
    }
  }

  // update the property subscription name
  async updatePropertySubscriptionName({
    propertySubscriptionId,
    name,
    entityProfileId,
  }: {
    propertySubscriptionId: string;
    name: string;
    entityProfileId: string;
  }) {
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      { where: { id: propertySubscriptionId, entityProfileId } },
    );
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found');
    }
    propertySubscription.propertySubscriptionName = name;
    await this.dbManager.save(propertySubscription);
  }

  async toggleBillingStatus({
    propertySubscriptionId,
    isBillingActive,
    entityProfileId,
  }: {
    propertySubscriptionId: string;
    isBillingActive: boolean;
    entityProfileId: string;
  }) {
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      { where: { id: propertySubscriptionId, entityProfileId } },
    );
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found');
    }
    propertySubscription.isBillingActive = isBillingActive;
    await this.dbManager.save(propertySubscription);

    return {
      success: true,
      message: `Billing ${isBillingActive ? 'activated' : 'deactivated'} for ${
        propertySubscription.propertySubscriptionName
      }`,
      isBillingActive,
    };
  }

  async deletePropertySubscription({
    propertySubscriptionId,
    entityProfileId,
  }: {
    propertySubscriptionId: string;
    entityProfileId: string;
  }) {
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      { where: { id: propertySubscriptionId, entityProfileId } },
    );
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found');
    }

    // Soft delete - sets deletedAt timestamp
    await this.dbManager.softDelete(
      PropertySubscription,
      propertySubscriptionId,
    );

    return {
      success: true,
      message: `Property subscription "${propertySubscription.propertySubscriptionName}" has been deleted successfully`,
      propertySubscriptionId,
    };
  }

  async testSmsForSubscription({
    subscriptionId,
    phoneNumber,
    entityProfileId,
  }: {
    subscriptionId: string;
    phoneNumber: string;
    entityProfileId: string;
  }) {
    // Find the subscription with all relations
    const subscription = await this.dbManager.findOne(PropertySubscription, {
      where: { id: subscriptionId, entityProfileId },
      relations: ['street', 'entitySubscriberProfile'],
    });

    if (!subscription) {
      throwBadRequest('Property subscription not found');
    }

    // Get the latest billing for this subscription
    const billing = await this.dbManager.findOne(Billing, {
      where: { propertySubscriptionId: subscriptionId },
      order: { createdAt: 'DESC' },
    });

    if (!billing) {
      throwBadRequest('No billing found for this subscription');
    }

    // Get property address
    const propertyAddress = `${subscription.streetNumber || ''} ${
      subscription.street?.name || 'Unknown Street'
    }`.trim();

    // Queue the notification with test phone number
    await this.notificationService.queueBillingNotification({
      recipientPhone: phoneNumber,
      recipientEmail: null,
      recipientName:
        subscription.entitySubscriberProfile?.firstName +
          ' ' +
          subscription.entitySubscriberProfile?.lastName || 'Test User',
      amount: parseFloat(billing.amount) || 0,
      month: billing.month,
      year: billing.year,
      propertyAddress,
      entityProfileId,
    });

    return {
      success: true,
      message: `Test SMS notification queued for ${phoneNumber}`,
      billing: {
        amount: billing.amount,
        month: billing.month,
        year: billing.year,
      },
      propertyAddress,
    };
  }

  async createUser(
    createUserDto: CreateUserDto,
    authPayload: AuthTokenPayload,
  ) {
    const { profileType } = createUserDto;
    if (
      ![
        ProfileTypes.ENTITY_SUBSCRIBER_PROFILE,
        ProfileTypes.ENTITY_USER_PROFILE,
      ].includes(profileType)
    ) {
      throwBadRequest('Invalid profile');
    }

    delete createUserDto.profileType;

    const entityProfileId = authPayload.profile.entityProfileId;
    const phoneCode = await this.getPhoneCodeOrThrow({
      phoneCodeId: createUserDto.phoneCodeId,
    });

    // create user in central user manager
    const authServerRequestPath = `/project/app/signup`;

    const defaultPassword = 'no-password';
    const phoneNumber = createUserDto.phone;
    const response = await this.requestService.requestApiService(
      authServerRequestPath,
      {
        body: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: defaultPassword,
          ...(phoneNumber ? { phone: `${phoneNumber}` } : {}),
          ...(phoneNumber ? { phoneCode: `${phoneCode.name}` } : {}),
        },
        method: 'POST',
      },
    );

    if (response.status !== 201) {
      throw new HttpException('User creation failed', 500);
    }
    const userData:
      | undefined
      | (AuthenticatedUserData & {
          isVerified?: boolean;
          isNewUser?: boolean;
          userCreatedInApp?: boolean;
        }) = response.data;

    if (!userData) {
      throw new HttpException('User creation failed', 500);
    }

    if (!userData.isNewUser && !userData.userCreatedInApp) {
      throwForbidden('User already exist!');
    }

    let userProfile: EntityUserProfile | EntitySubscriberProfile;
    if (profileType === ProfileTypes.ENTITY_USER_PROFILE) {
      userProfile = this.dbManager.create(EntityUserProfile, {
        ...createUserDto,
        entityProfileId,
      });

      await this.dbManager.save(userProfile);
    } else if (profileType === ProfileTypes.ENTITY_SUBSCRIBER_PROFILE) {
      userProfile = this.dbManager.create(EntitySubscriberProfile, {
        ...createUserDto,
        createdByEntityProfileId: entityProfileId,
        createdByEntityUserProfileId: authPayload.profile.profileTypeId,
      });

      await this.dbManager.save(userProfile);
    }

    const profileCollection = this.dbManager.create(ProfileCollection, {
      profileType,
      userId: userData.id,
      isAdmin: false,
      profileTypeId: userProfile.id,
    });

    await this.dbManager.save(profileCollection);
  }

  async getEntityUserSubscriber(
    entityProfileId: string,
    {
      query,
      page,
      count = 10,
    }: { query?: string; page?: number; count?: number } = {},
  ) {
    let entitySubscriberProfiles: EntitySubscriberProfile[] = [];
    entitySubscriberProfiles = await this.dbManager.find(
      EntitySubscriberProfile,
      {
        where: {
          createdByEntityUserProfileId: entityProfileId,
        },
      },
    );

    return entitySubscriberProfiles;
  }

  async getEntityUserSubscriberByEntityProfileId(
    entityProfileId: string,
    {
      query,
      page,
      count = 10,
    }: { query?: string; page?: number; count?: number } = {},
  ) {
    // Find all users belonging to this entity profile
    const entityUsers = await this.dbManager.find(EntityUserProfile, {
      where: { entityProfileId },
      select: ['id'],
    });

    if (entityUsers.length === 0) {
      return [];
    }

    const entityUserIds = entityUsers.map((user) => user.id);

    // Find all subscribers created by any user in this entity
    const entitySubscriberProfiles = await this.dbManager
      .createQueryBuilder(EntitySubscriberProfile, 'subscriber')
      .where('subscriber.createdByEntityUserProfileId IN (:...userIds)', {
        userIds: entityUserIds,
      })
      .orWhere('subscriber.createdByEntityProfileId = :entityProfileId', {
        entityProfileId,
      })
      .getMany();

    return entitySubscriberProfiles;
  }

  async createPropertySubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    authPayload: AuthTokenPayload,
  ) {
    // verify streetId, propertyTypeId, propertySubscriberProfileId, oldCode.
    await this.getStreetOrThrowError({
      streetId: createSubscriptionDto.streetId,
    });

    // verify propertyTypeId
    await this.getPropertyTypeOrThrowError({
      propertyTypeId: createSubscriptionDto.propertyTypeId,
    });

    // verify oldCode
    const existingOldCode = await this.dbManager.findOne(PropertySubscription, {
      where: {
        oldCode: createSubscriptionDto.oldCode,
      },
    });

    if (existingOldCode) {
      throwBadRequest('Old code supplied has been used.');
    }

    // verify propertySubscriberProfileId
    await this.validateEntitySubscriberProfileById(
      createSubscriptionDto.propertySubscriberProfileId,
    );

    const subscriberProfileRole = createSubscriptionDto.isOwner
      ? SubscriberProfileRoleEnum.OWNER
      : SubscriberProfileRoleEnum.CUSTODIAN;

    await this.dbManager.transaction(async (transactionManager) => {
      // create subscriber property
      let subscriberProperty = transactionManager.create(
        EntitySubscriberProperty,
        {
          propertyTypeId: createSubscriptionDto.propertyTypeId,
          ...(createSubscriptionDto.isOwner
            ? {
                ownerEntitySubscriberProfileId:
                  createSubscriptionDto.propertySubscriberProfileId,
              }
            : {}),
        },
      );

      subscriberProperty = await transactionManager.save(subscriberProperty);

      // create property subscription
      let propertySubscription = transactionManager.create(
        PropertySubscription,
        {
          propertySubscriptionName: createSubscriptionDto.propertyName,
          oldCode: createSubscriptionDto.oldCode,
          streetNumber: createSubscriptionDto.streetNumber,
          streetId: createSubscriptionDto.streetId,
          entitySubscriberProfileId:
            createSubscriptionDto.propertySubscriberProfileId,
          subscriberProfileRole: subscriberProfileRole,
          entityProfileId: authPayload.profile.entityProfileId,
        },
      );

      propertySubscription = await transactionManager.save(
        propertySubscription,
      );
      const propertySubscriptionId = propertySubscription.id;

      // create property unit
      const propertySubscriptionUnit = transactionManager.create(
        PropertySubscriptionUnit,
        {
          propertySubscriptionId,
          entiySubscriberPropertyId: subscriberProperty.id,
          propertyUnits: createSubscriptionDto.propertyUnit,
        },
      );

      await transactionManager.save(propertySubscriptionUnit);

      // create billling account
      const billingAccount = transactionManager.create(BillingAccount, {
        propertySubscriptionId,
      });

      await transactionManager.save(billingAccount);
    });
  }

  async getSubscriptions(
    entityProfileId: string,
    {
      rowsPerPage = 10,
      page = 1,
      streetId,
      descending,
      filter,
      sortBy,
    }: {
      rowsPerPage?: number;
      limit?: number;
      page?: number;
      streetId?: string;
      descending?: boolean;
      filter?: string;
      sortBy?: string;
    } = {},
  ) {
    //
    // let filterBy = filter ? JSON.parse(filter) : null;

    // Build where conditions based on filter type
    let whereConditions: any[] | any;

    if (filter) {
      if (isNumberString(filter)) {
        // Numeric search
        whereConditions = [
          // Search by numeric ID (convert to string for LIKE comparison)
          {
            entityProfileId,
            deletedAt: IsNull(),
            id: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :filter`, {
              filter: `%${filter}%`,
            }),
          },
          // Search by oldCode (partial match)
          {
            entityProfileId,
            deletedAt: IsNull(),
            oldCode: ILike(`%${filter}%`),
          },
          // Search by street number (partial match)
          {
            entityProfileId,
            deletedAt: IsNull(),
            streetNumber: ILike(`%${filter}%`),
          },
        ];
      } else {
        // Text search
        whereConditions = [
          {
            entityProfileId,
            deletedAt: IsNull(),
            street: { name: ILike(`%${filter}%`) },
          },
          {
            entityProfileId,
            deletedAt: IsNull(),
            propertySubscriptionName: ILike(`%${filter}%`),
          },
          // Also search oldCode for non-numeric strings
          {
            entityProfileId,
            deletedAt: IsNull(),
            oldCode: ILike(`%${filter}%`),
          },
        ];
      }
    } else {
      whereConditions = {
        entityProfileId,
        deletedAt: IsNull(),
        ...(streetId ? { streetId } : {}),
      };
    }

    const [propertySubscriptions, totalCount] =
      await this.dbManager.findAndCount(PropertySubscription, {
        where: whereConditions,
        ...(!streetId
          ? { take: rowsPerPage, skip: (page - 1) * rowsPerPage }
          : {}),
        relations: {
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
          billingAccount: true,
          entitySubscriberProfile: {
            phoneCode: true,
          },
          street: true,
        },
        ...(sortBy ? { order: { [sortBy]: descending ? 'DESC' : 'ASC' } } : {}),
      });

    const mappedResponse = propertySubscriptions.map((sub) => {
      return {
        propertySubscriptionId: sub.id,
        propertySubscriptionName: sub.propertySubscriptionName,
        oldCode: sub.oldCode,
        streetNumber: sub.streetNumber,
        createdAt: sub.createdAt,
        streetId: sub.streetId,
        entitySubscriberProfileId: sub.entitySubscriberProfileId,
        isBillingActive: sub.isBillingActive ?? true, // Include billing status
        propertySubscriptionUnits: sub.propertySubscriptionUnits?.map(
          (unit) => {
            return {
              entitySubscriberPropertyId: unit.entitySubscriberProperty?.id,
              createdAt: unit.entitySubscriberProperty?.createdAt,
              propertyType: {
                ...unit.entitySubscriberProperty?.propertyType,
                updatedAt: undefined,
                entityProfileId: undefined,
              },
            };
          },
        ),
        arrears: (() => {
          let arr =
            Number(sub.billingAccount.totalBillings || '0') -
            Number(sub.billingAccount.totalPayments || '0');
          arr = arr < 0 ? 0 : arr;
          return arr;
        })(),
        entitySubscriberProfile: {
          ...sub.entitySubscriberProfile,
          updatedAt: undefined,
          phone: sub.entitySubscriberProfile?.phone,
          phoneCode: sub.entitySubscriberProfile?.phoneCode?.name,
        },
        streetName: sub.street?.name,
      };
    });

    // Filter by arrears if numeric filter is provided
    // NOTE: Commented out as it was filtering out valid results
    // let filteredResponse = mappedResponse;
    // if (filter && isNumberString(filter)) {
    //   const arrearsThreshold = parseFloat(filter);
    //   filteredResponse = mappedResponse.filter(
    //     (item) => item.arrears <= arrearsThreshold,
    //   );
    // }

    return {
      data: mappedResponse,
      pagination: {
        rowsNumber: totalCount,
        rowsPerPage,
        page,
        sortBy,
        descending,
      },
      filter,
    };
  }

  async createPropertyType(
    createPropertyTypesDto: CreatePropertyTypesDto,
    entityProfileId: string,
  ) {
    //
    let propertyType: PropertyType;
    if (createPropertyTypesDto.id === undefined) {
      propertyType = this.dbManager.create(PropertyType, {
        name: createPropertyTypesDto.name,
        unitPrice: createPropertyTypesDto.unitPrice,
        entityProfileId,
      });
    } else {
      propertyType = await this.dbManager.findOne(PropertyType, {
        where: {
          id: createPropertyTypesDto.id,
          // ensures the property type belongs to the entity profile
          entityProfileId,
        },
      });
      if (!propertyType) {
        throwBadRequest('Property type not found.');
      }
      propertyType.name = createPropertyTypesDto.name;
      propertyType.unitPrice = createPropertyTypesDto.unitPrice;
    }

    await this.dbManager.save(propertyType);
  }

  async getPropertyTypes(
    entityProfileId: string,
    { name, unitPrice }: { name?: string; unitPrice?: string } = {},
  ) {
    //

    const propertyTypes =
      name || unitPrice
        ? await this.dbManager.find(PropertyType, {
            where: {
              entityProfileId,
              ...(name ? { name } : {}),
              ...(unitPrice ? { unitPrice } : {}),
            },
          })
        : await this.dbManager.find(PropertyType, {
            where: {
              entityProfileId,
            },
          });

    return propertyTypes;
  }

  async getBillingsByMonth(
    propertySubscriptionId: string,
    month: string,
    year: string,
    entityProfileId?: string,
  ) {
    //
    const billings = await this.dbManager.find(Billing, {
      where: {
        propertySubscriptionId,
        month,
        year,
        is_duplicate: false, // Only fetch non-duplicate billings
      },
      relations: {
        propertySubscription: {
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
          billingAccount: true,
          payments: true,
        },
      },
      take: 1, // Ensure only one billing is returned
      order: {
        createdAt: 'ASC', // Get the oldest (original) billing
      },
    });

    const mappedBilling = billings.map((bill) => {
      return {
        billing: {
          id: bill.id,
          amount: bill.amount,
          month: bill.month,
          year: bill.year,
        },
        arreas: bill.propertySubscription.billingAccount.totalBillings,
        propertySubscriptionUnits:
          bill.propertySubscription.propertySubscriptionUnits.map(
            (propertySubscriptionUnit) => {
              return {
                propertyType:
                  propertySubscriptionUnit.entitySubscriberProperty.propertyType
                    .name,
                unitPrice:
                  propertySubscriptionUnit.entitySubscriberProperty.propertyType
                    .unitPrice,
                unitCount: propertySubscriptionUnit.propertyUnits,
              };
            },
          ),
        lastPayment: {
          amount: bill.propertySubscription.payments.pop()?.amount,
          date: bill.propertySubscription.payments.pop()?.createdAt,
        },
      };
    });

    return mappedBilling;
  }

  async deleteBilling({
    entityProfileId,
    billingId,
  }: {
    entityProfileId: string;
    billingId: string;
  }) {
    const billingToDelete = await this.dbManager.findOne(Billing, {
      where: {
        id: billingId,
        propertySubscription: {
          entityProfileId,
        },
      },
    });

    if (billingToDelete) {
      await this.dbManager.delete(Billing, { id: billingId });
    }
  }

  async updateAccountRecord({
    entityProfileId,
    entityUserProfileId,
    billingArrears,
    propertySubscriptionId,
    reason,
    phone,
    phoneCodeId,
    phoneCode = '',
  }: {
    entityProfileId: string;
    entityUserProfileId: string;
    billingArrears: string;
    propertySubscriptionId: string;
    reason: string;
    phone?: string;
    phoneCodeId?: string;
    phoneCode?: string;
  }) {
    this.logger.log(
      `[updateAccountRecord] Starting - propertySubscriptionId: ${propertySubscriptionId}, arrears: ${billingArrears}, phone: ${
        phone ? 'provided' : 'not provided'
      }`,
    );

    if (phone) {
      if (!phoneCode && !phoneCodeId) {
        throwBadRequest('Phone code is required to update phone number.');
      }

      const phoneCodeRef = await this.dbManager.findOne(PhoneCode, {
        where: {
          ...(phoneCodeId ? { id: phoneCodeId } : { name: phoneCode }),
        },
      });

      if (!phoneCodeRef) {
        throwBadRequest('Invalide phone code parameter sent');
        return;
      }

      const virtualAccountTargetBank = this.configService.get('PREFERRED_BANK');
      const subscriberProperty = await this.dbManager.findOne(
        PropertySubscription,
        {
          where: {
            id: propertySubscriptionId,
          },
          relations: {
            entitySubscriberProfile: true,
          },
        },
      );

      const entitySubscriberProfile =
        subscriberProperty.entitySubscriberProfile;

      entitySubscriberProfile.phone = phone;
      entitySubscriberProfile.phoneCodeId = phoneCodeRef.id;

      await this.dbManager.transaction(async (transactionManager) => {
        await transactionManager.save(entitySubscriberProfile);

        // update the user profile in the central user manager (non-blocking)
        // make request to user manager
        let serverResponse;
        try {
          serverResponse = await this.requestService.requestApiService(
            '/project/app/user',
            {
              method: 'PUT',
              body: {
                phone,
                phoneCodeId,
                email: entitySubscriberProfile.email,
              },
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to update user on central server: ${error.message}`,
          );
          // Don't fail the transaction - local update succeeded
          return;
        }

        if (sucessHttpCodes.includes(serverResponse.status)) {
          // create virtual account on fintech service (paystack)
          // check if virtual account exist form this account:
          const dvaEmail = entitySubscriberProfile.email.toLocaleLowerCase();
          const existingDVA = await this.dbManager.findOne(
            VirtualAccountDetail,
            {
              where: {
                email: dvaEmail,
                bank: virtualAccountTargetBank,
              },
            },
          );

          const entityProfileBankAccountDetail = await this.dbManager.findOne(
            EntityProfileBankAccountDetails,
            {
              where: {
                entityProfileId,
              },
            },
          );

          if (!existingDVA) {
            const dvaUserData: SingleStepDVAUserData = {
              email: dvaEmail,
              first_name: entityProfileBankAccountDetail.accountName,
              middle_name:
                entitySubscriberProfile.middleName ||
                entitySubscriberProfile.lastName,
              last_name: subscriberProperty.propertySubscriptionName,
              phone: `${phoneCodeRef.name}${entitySubscriberProfile.phone}`,
              preferred_bank: virtualAccountTargetBank,
            };

            try {
              const paystackServerResponse =
                await this.paystackService.createDedicatedVirtualAccountSingleStep(
                  dvaUserData,
                );

              if (paystackServerResponse.status) {
                // create virtual account details for subscriber.
                await this.createSubscriberVirtualAccountDetail({
                  dbManager: transactionManager,
                  email: entitySubscriberProfile.email.toLowerCase(),
                  bank: dvaUserData.preferred_bank,
                  propertySubscriptionId,
                });
              } else {
                // TODO: handle case where DVA creation status is false
              }
            } catch (error) {
              throwServerError();
            }
          }
          // send sucess result
        } else if (serverResponse.status === 400) {
          // send client error
          throwBadRequest('One or more fields are invalid.');
        } else {
          throwServerError();
        }
      });
      
      this.logger.log(
        `[updateAccountRecord] Successfully updated phone for property ${propertySubscriptionId}`,
      );
      
      return {
        success: true,
        message: 'Phone number updated successfully',
      };
    }
    const associatedBillingAccount = await this.dbManager.findOne(
      BillingAccount,
      {
        where: {
          propertySubscription: {
            id: propertySubscriptionId,
            entityProfileId,
          },
        },
      },
    );

    if (!associatedBillingAccount) {
      throwBadRequest('Could not find the referenced billing Account');
      return;
    }

    let currentArrears = bignumber(associatedBillingAccount.totalBillings)
      .minus(associatedBillingAccount.totalPayments)
      .toNumber();
    currentArrears = currentArrears > 0 ? currentArrears : 0;

    const newArrears = bignumber(billingArrears).toNumber();

    /// update billing acount: if newArrears > currentArrears add difference to account's total billing
    const arrearsDifference = newArrears - currentArrears;
    if (arrearsDifference >= 0) {
      associatedBillingAccount.totalBillings = String(
        bignumber(associatedBillingAccount.totalBillings).add(
          arrearsDifference,
        ),
      );
    } else {
      associatedBillingAccount.totalPayments = String(
        bignumber(associatedBillingAccount.totalPayments).add(
          Math.abs(arrearsDifference),
        ),
      );
    }

    // Check if the user exists in the local EntityUserProfile table
    let localUser = null;
    try {
      localUser = await this.dbManager.findOne(EntityUserProfile, {
        where: { id: entityUserProfileId },
      });
      this.logger.log(
        `[updateAccountRecord] Local user check: ${localUser ? 'found' : 'not found'} for userId: ${entityUserProfileId}`,
      );
    } catch (error) {
      this.logger.warn(
        `[updateAccountRecord] Error checking local user: ${error.message}`,
      );
    }

    try {
      await this.dbManager.transaction(async (transactionManager) => {
        await transactionManager.save(associatedBillingAccount);

        // track arrears update
        const arrearsUpdate = transactionManager.create(ArrearsUpdate, {
          amountAfterUpdate: newArrears.toString(),
          amountBeforeUpdate: currentArrears.toString(),
          reasonToUpdate: reason,
          propertySubscriptionId: propertySubscriptionId,
          // Only set updatedByUserId if the user exists locally
          updatedByUserId: localUser ? entityUserProfileId : null,
        });

        this.logger.log(
          `[updateAccountRecord] Saving arrears update - updatedByUserId: ${localUser ? entityUserProfileId : 'null'}`,
        );

        await transactionManager.save(arrearsUpdate);
      });
    } catch (error) {
      this.logger.error(
        `[updateAccountRecord] Transaction failed: ${error.message}`,
        error.stack,
      );
      throwServerError('Failed to update arrears: ' + error.message);
    }

    this.logger.log(
      `[updateAccountRecord] Successfully updated arrears from ${currentArrears} to ${newArrears} for property ${propertySubscriptionId}`,
    );

    return {
      success: true,
      message: 'Outstanding balance updated successfully',
      data: {
        previousArrears: currentArrears,
        newArrears: newArrears,
      },
    };
  }

  async createSubscriberVirtualAccountDetail({
    dbManager,
    email,
    bank,
    propertySubscriptionId,
  }: {
    dbManager: EntityManager;
    email: string;
    bank: string;
    propertySubscriptionId: string;
  }) {
    try {
      const newSubscriberVirtualAccount = dbManager.create(
        VirtualAccountDetail,
        {
          email,
          propertySubscriptionId,
          bank,
        },
      );

      await dbManager.save(newSubscriberVirtualAccount);
    } catch (error) {
      Logger.error('Error creating virtual account', error.message);
    }
  }

  async generateBilling(
    generatePrintBIllingDto: GenerateBillingDto,
    entityProfileId: string,
  ) {
    // check if to generate for all properties
    if (generatePrintBIllingDto.forAllProperties) {
      throwBadRequest('This is currently not available.');
    } else if (generatePrintBIllingDto.forPropertiesOnStreet) {
      // Handle street-level billing generation - SEQUENTIAL to prevent race conditions
      const properties = await this.dbManager.find(PropertySubscription, {
        where: {
          streetId: generatePrintBIllingDto.streetId,
          entityProfileId,
          isBillingActive: true, // Only generate billing for active subscriptions
        },
      });

      await this.dbManager.transaction(async (transactionManager) => {
        // Changed from Promise.all to sequential loop to prevent duplicate billing race conditions
        for (const prop of properties) {
          try {
            await this.generateMonthBilling(
              prop.id,
              generatePrintBIllingDto.month,
              {
                year: generatePrintBIllingDto.year,
                throwError: false,
                transactionManager,
              },
            );
          } catch (error) {
            Logger.warn(
              `Failed to generate billing for property ${prop.id}: ${error.message}`,
            );
          }
        }
      });
    } else {
      //
      const propertySubscriptionId =
        generatePrintBIllingDto.propertySubscriptionId ||
        generatePrintBIllingDto.propertySuscriptionId;
      await this.generateMonthBilling(
        propertySubscriptionId,
        generatePrintBIllingDto.month,
        {
          year: generatePrintBIllingDto.year,
          transactionManager: this.dbManager,
        },
      );
    }
  }

  async getBilling(
    generatePrintBIllingDto: GetBillingQuery,
    entityProfileId: string,
  ) {
    //
    if (generatePrintBIllingDto.forAllProperties) {
      //
      throwBadRequest('This is currently not available.');
    } else if (
      generatePrintBIllingDto.forPropertiesOnStreet ||
      generatePrintBIllingDto.streetId
    ) {
      const properties = await this.dbManager.find(PropertySubscription, {
        where: {
          streetId: generatePrintBIllingDto.streetId,
          entityProfileId,
        },
      });

      const billings = await Promise.all(
        properties.map(async (prop) => {
          await this.getBillingsByMonth(
            prop.id,
            generatePrintBIllingDto.month,
            generatePrintBIllingDto.year,
          );
        }),
      );

      return billings;
    } else {
      // Support both correct and legacy typo property names
      const propertySubscriptionId =
        generatePrintBIllingDto.propertySubscriptionId ||
        generatePrintBIllingDto.propertySuscriptionId;

      // If no month/year specified, return all billings for the property (for billing history view)
      if (!generatePrintBIllingDto.month && !generatePrintBIllingDto.year) {
        const billings = await this.dbManager.find(Billing, {
          where: {
            propertySubscriptionId,
            is_duplicate: false,
          },
          order: {
            year: 'DESC',
            month: 'DESC',
            createdAt: 'DESC',
          },
        });
        return billings;
      }

      // For specific month/year (print billing use case)
      const billings = await this.getBillingsByMonth(
        propertySubscriptionId,
        generatePrintBIllingDto.month,
        generatePrintBIllingDto.year,
        entityProfileId,
      );

      return billings;
    }
  }

  async generateMonthBilling(
    propertySubscriptionId: string,
    month: string,
    {
      year,
      throwError = true,
      transactionManager,
    }: {
      year?: string;
      throwError?: boolean;
      transactionManager: EntityManager;
    },
  ) {
    //

    const dbManager = transactionManager;
    const propertySubscription = await dbManager.findOne(PropertySubscription, {
      where: {
        id: propertySubscriptionId,
      },
    });
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found.');
    }

    const billingAccount = await dbManager.findOne(BillingAccount, {
      where: {
        propertySubscriptionId,
      },
    });

    if (!billingAccount) {
      throwBadRequest('Billing account not found.');
    }

    const billingAlreadyGenerated = await dbManager.findOne(Billing, {
      where: {
        propertySubscriptionId: propertySubscription.id,
        month: month || this.getMonthName(),
        year: year || new Date().getFullYear().toString(),
        is_duplicate: false, // Only check non-duplicate billings
      },
    });

    if (billingAlreadyGenerated) {
      if (!throwError) {
        return null;
      }
      throwBadRequest(
        `Billing already generated for ${propertySubscription.propertySubscriptionName}.`,
      );
      return;
    }

    const propertySubscriptionUnits = await dbManager.find(
      PropertySubscriptionUnit,
      {
        where: {
          propertySubscriptionId,
        },
        relations: {
          entitySubscriberProperty: {
            propertyType: true,
          },
        },
      },
    );

    const billingAmount = this.calculateBillingAmount(
      propertySubscriptionUnits,
    );

    // Calculate previous arrears (total billings - total payments before this billing)
    const previousArrears = bignumber(billingAccount.totalBillings)
      .minus(billingAccount.totalPayments)
      .toString();

    const currentBilling = dbManager.create(Billing, {
      propertySubscriptionId: propertySubscription.id,
      month: month || this.getMonthName(),
      year: year || new Date().getFullYear().toString(),
      amount: billingAmount.toString(),
      previousArrears: previousArrears, // Populate previousArrears for audit
      is_duplicate: false, // Mark as non-duplicate
    });
    await dbManager.save(currentBilling);

    // update billing account
    // TODO: use bigNumber form math js
    billingAccount.totalBillings = bignumber(billingAccount.totalBillings)
      .add(currentBilling.amount)
      .toString();

    await dbManager.save(billingAccount);
  }

  calculateBillingAmount(propertyUnits: PropertySubscriptionUnit[]) {
    return propertyUnits.reduce((total, propertySubscriptionUnit) => {
      return (
        total +
        propertySubscriptionUnit.propertyUnits *
          (Number(
            propertySubscriptionUnit.entitySubscriberProperty.propertyType
              .unitPrice,
          ) || 0)
      );
    }, 0);
  }

  async getBillingAccountArrears(
    entityProfileId: string,
    {
      limit = 5,
      page = 1,
      month = this.getMonthName(),
      year = new Date().getFullYear().toString(),
    }: { limit?: number; page?: number; month?: string; year?: string } = {},
  ) {
    const streetsOwnedByEntity = await this.dbManager.find(Street, {
      where: {
        entityProfileId,
        ...(month
          ? {
              propertySubscriptions: {
                billings: {
                  month,
                  year,
                },
              },
            }
          : {}),
      },
      relations: {
        propertySubscriptions: {
          billingAccount: true,
          billings: true,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const mappedStreetsAndArrears = streetsOwnedByEntity.map((street) => {
      return {
        streetId: street.id,
        streetName: street.name,
        totalBilling: street.propertySubscriptions.reduce((total, sub) => {
          return total + Number(sub.billingAccount.totalBillings || 0);
        }, 0),
        arrears: street.propertySubscriptions.reduce((total, sub) => {
          const currentArrears =
            Number(sub.billingAccount.totalBillings || 0) -
            Number(sub.billingAccount.totalPayments || 0);

          total += currentArrears > 0 ? currentArrears : 0;
          return total;
        }, 0),
      };
    });

    return mappedStreetsAndArrears;
  }

  async getSubscriptionDetails(
    entityProfileId: string,
    propertySubscriptionId: string,
  ) {
    // get property subsription for the current profile and the provided subscription id
    if (!entityProfileId || !propertySubscriptionId) {
      throwBadRequest('Kindly, provide a valid property reference.');
    }
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertySubscriptionId,
          entityProfileId,
        },
        relations: {
          payments: true,
          billingAccount: true,
          entitySubscriberProfile: {
            phoneCode: true,
          },
          subscriberVirtualAccountDetails: true,
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
          street: true,
        },
      },
    );

    return propertySubscription;
  }

  async savePropertyUnits(
    entityProfileId: string,
    propertyUnitsDetails: SavePropertyUnitsDetailsDto,
  ) {
    // deduplicate record
    const propertyUnitsTypesDto =
      propertyUnitsDetails.propertySubscriptionUnits;
    // check if propertyType has no duplicate
    // identity and remove possible duplicates
    const uniquePropertyTypes: { [key: string]: SavePropertyUnitsDto } = {};
    propertyUnitsDetails.propertySubscriptionUnits =
      propertyUnitsTypesDto.filter((eachUnitTypeDto) => {
        if (eachUnitTypeDto.propertyType.trim() === '') {
          return false;
        }
        const isUnique = !uniquePropertyTypes[eachUnitTypeDto.propertyType];
        if (isUnique) {
          uniquePropertyTypes[eachUnitTypeDto.propertyType] = eachUnitTypeDto;
        }

        return isUnique;
      });

    //
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertyUnitsDetails.propertySubscriptionId,
          entityProfileId,
        },
        relations: {
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
        },
      },
    );

    if (!propertySubscription) {
      throwBadRequest('Invalide Parameters received.');
    }

    const savedPropertyUnits = propertySubscription.propertySubscriptionUnits;

    const exitingPropertyUnitTypes: SavePropertyUnitsDto[] = [];

    const propertyUnitsToRemove: PropertySubscriptionUnit[] = [];
    const existingPropertyUnitsAndType = savedPropertyUnits.filter(
      (eachPropertyUnit) => {
        const existingUnitMatch =
          propertyUnitsDetails.propertySubscriptionUnits.findIndex(
            (eachSubcriptionUnit) =>
              eachSubcriptionUnit.propertyTypeId ===
              eachPropertyUnit.entitySubscriberProperty.propertyType.id,
          ) !== -1;

        if (!existingUnitMatch) {
          propertyUnitsToRemove.push(eachPropertyUnit);
        } else {
          const propertyUnitDto =
            propertyUnitsDetails.propertySubscriptionUnits.find(
              (eachDto) =>
                eachDto.propertyType.toLocaleLowerCase() ===
                eachPropertyUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase(),
            );
          exitingPropertyUnitTypes.push(propertyUnitDto);
        }
        return existingUnitMatch;
      },
    );

    const newPropertyUnitsTypes =
      propertyUnitsDetails.propertySubscriptionUnits.filter(
        (eachUnitDto) =>
          exitingPropertyUnitTypes.findIndex(
            (eachUnitType) =>
              eachUnitType.propertyTypeId === eachUnitDto.propertyTypeId,
          ) === -1,
      );

    await this.dbManager.transaction(async (transactionManager) => {
      // remove associated property unit types that have been removed.
      for await (const eachPropertyUnitToRemove of propertyUnitsToRemove) {
        await this.dbManager.delete(PropertySubscriptionUnit, {
          entiySubscriberPropertyId:
            eachPropertyUnitToRemove.entiySubscriberPropertyId,
          propertySubscriptionId:
            eachPropertyUnitToRemove.propertySubscriptionId,
        });
        await this.dbManager.delete(EntitySubscriberProperty, {
          id: eachPropertyUnitToRemove.entitySubscriberProperty.id,
        });
      }

      // update the property unit for existing property unit type
      for await (const prorpertytype of exitingPropertyUnitTypes) {
        const propertyUnit = existingPropertyUnitsAndType.find(
          (eachUnit) =>
            eachUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase() ===
            prorpertytype.propertyType.toLocaleLowerCase(),
        );

        if (propertyUnit) {
          propertyUnit.propertyUnits = Number(prorpertytype.propertyUnit);
          await this.dbManager.save(propertyUnit);
        }
      }

      for await (const propertyType of newPropertyUnitsTypes) {
        // add new property units
        // const newPropertyUnitType =
        //   propertyUnitsDetails.propertySubscriptionUnits.find(
        //     (eachUnitDto) =>
        //       eachUnitDto.propertyType === propertyType.propertyType,
        //   );

        // if (newPropertyUnitType) {
        //   newPropertyUnitsTypes.push(newPropertyUnitType);
        // }

        // create a new proeperty type
        let referencedPropertyType = await this.dbManager.findOne(
          PropertyType,
          {
            where: { id: propertyType.propertyTypeId },
          },
        );

        if (!referencedPropertyType) {
          referencedPropertyType = transactionManager.create(PropertyType, {
            name: propertyType.propertyType,
            unitPrice: propertyType.unitPrice,
            entityProfileId,
          });

          referencedPropertyType = await transactionManager.save(
            referencedPropertyType,
          );
        }

        // create entity subscriber property
        let entitySubscriberProperty = transactionManager.create(
          EntitySubscriberProperty,
          {
            ownerEntitySubscriberProfileId:
              propertySubscription.entitySubscriberProfileId,
            propertyTypeId: referencedPropertyType.id,
          },
        );

        entitySubscriberProperty = await transactionManager.save(
          entitySubscriberProperty,
        );

        // create the entity subscription property unit
        const propertySubscriptionUnit = transactionManager.create(
          PropertySubscriptionUnit,
          {
            propertySubscriptionId: propertySubscription.id,
            entiySubscriberPropertyId: entitySubscriberProperty.id,
            propertyUnits: Number(propertyType.propertyUnit),
          },
        );

        await transactionManager.save(propertySubscriptionUnit);
      }
    });
  }

  // async getPropertyTypes({ entityProfileId, queryTerm }:{entityProfileId: string, queryTerm: string}) {
  //   const propertyTypes = await this.dbManager.find(PropertyType, {
  //     where: {
  //       ...(queryTerm ? { name: ILike(`%${queryTerm}%`)} : {}),
  //       { entityProfileId}
  //     }
  //   })
  // }

  async getBillingDetailsOrDefaulters(
    entityProfileId: string,
    {
      streetId,
      billingMonth,
      billingYear = new Date().getFullYear(),
      propertySubscriptionId,
    }: {
      streetId: string;
      billingMonth?: string;
      billingYear?: number;
      propertySubscriptionId?: string;
    },
  ) {
    //
    const street = await this.getStreetOrThrowError({
      streetId,
      entityProfileId,
      throwError: true,
    });

    // TODO: validate billing month

    let billingDetails: {
      streetName: string;
      PropertySubscriptionId: string;
      propertyName: string;
      currentBilling: string;
      arrears: number;
      totalBilling?: string;
      currentBillingId?: string;
    }[] = [];
    if (!billingMonth) {
      const propertySubscriptions = await this.dbManager.find(
        PropertySubscription,
        {
          where: {
            streetId,
            billingAccount: {
              totalBillings: Raw(
                () => `"totalBillings" - "totalPayments" > '0' :: numeric`,
              ),
            },
          },
          relations: {
            billings: true,
            billingAccount: true,
          },
        },
      );

      billingDetails = propertySubscriptions.map((propertySubscription) => {
        let arrears = bignumber(
          propertySubscription.billingAccount.totalBillings,
        )
          .sub(propertySubscription.billingAccount.totalPayments)
          .toNumber();

        arrears = arrears >= 0 ? arrears : 0;
        return {
          streetName: street.name,
          PropertySubscriptionId: propertySubscription.id,
          propertyName: propertySubscription.propertySubscriptionName,
          currentBilling: propertySubscription.billings?.[0]?.amount || '0',
          currentBillingId: propertySubscription.billings?.[0]?.id || '0',
          arrears,
        };
      });
    } else {
      billingDetails = await this.dbManager
        .createQueryBuilder(PropertySubscription, 'propertySubscription')
        .select((qb) => {
          return qb
            .from(Street, 'street')
            .select('street.name', 'streetName')
            .where('street.id = :streetId', { streetId });
        }, 'streetName')
        .addSelect('propertySubscription.streetNumber', 'streetNumber')
        .addSelect('propertySubscription.id', 'propertySubscriptionId')
        .addSelect(
          'propertySubscription.propertySubscriptionName',
          'propertyName',
        )
        .addSelect(
          (qb) =>
            qb
              .from(BillingAccount, 'billingAccount')
              .select(
                `case when "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                      .createQueryBuilder(Billing, 'billing')
                      .select('billing.amount', 'amount')
                      .where(`billing.month = :billingMonth`)
                      .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                      })
                      .andWhere(
                        'billing.propertySubscriptionId = "propertySubscription"."id"',
                      )
                      .andWhere(
                        '(billing.is_duplicate = false OR billing.is_duplicate IS NULL)',
                      )
                      .orderBy('billing.createdAt', 'ASC')
                      .limit(1)
                      .getQuery()}
                  ) :: numeric, 0) > 0
                  then "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                      .createQueryBuilder(Billing, 'billing')
                      .select('billing.amount', 'amount')
                      .where(`billing.month = :billingMonth`)
                      .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                      })
                      .andWhere(
                        'billing.propertySubscriptionId = "propertySubscription"."id"',
                      )
                      .andWhere(
                        '(billing.is_duplicate = false OR billing.is_duplicate IS NULL)',
                      )
                      .orderBy('billing.createdAt', 'ASC')
                      .limit(1)
                      .getQuery()}
                  ) :: numeric, 0)
                  else 0
                  end
                  `,
                'arrears',
              )
              .where(
                `billingAccount.propertySubscriptionId = "propertySubscription"."id"`,
              ),
          'arrears',
        )
        .addSelect(
          (qb) =>
            qb
              .from(Billing, 'billing')
              .select('billing.amount', 'amount')
              .where(`billing.month = :billingMonth`)
              .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
              .andWhere(
                'billing.propertySubscriptionId = "propertySubscription"."id"',
              )
              .andWhere(
                '(billing.is_duplicate = false OR billing.is_duplicate IS NULL)',
              )
              .orderBy('billing.createdAt', 'ASC')
              .limit(1),
          'currentBilling',
        )
        .addSelect(
          (qb) =>
            qb
              .from(Billing, 'billing')
              .select('billing.id', 'id')
              .where(`billing.month = :billingMonth`)
              .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
              .andWhere(
                'billing.propertySubscriptionId = "propertySubscription"."id"',
              )
              .andWhere(
                '(billing.is_duplicate = false OR billing.is_duplicate IS NULL)',
              )
              .orderBy('billing.createdAt', 'ASC')
              .limit(1),
          'currentBillingId',
        )
        .addSelect(
          (qb) =>
            qb
              .from(BillingAccount, 'billingAccount')
              .select(
                `case when "billingAccount"."totalBillings" - "billingAccount"."totalPayments" < 0 
                    then 0
                    else "billingAccount"."totalBillings" - "billingAccount"."totalPayments"
                    end
                    `,
                'totalBilling',
              )
              .where(
                `billingAccount.propertySubscriptionId = "propertySubscription"."id"`,
              ),
          'totalBilling',
        )
        .addSelect((qb) => {
          return qb
            .from(PropertySubscriptionUnit, 'propertySubscriptionUnit')
            .select(
              `json_agg(json_build_object(
                'propertyUnits', "propertySubscriptionUnit"."propertyUnits",
                'propertyType', (select "subQuery"."propertyTypeName" from (${this.dbManager
                  .createQueryBuilder(
                    EntitySubscriberProperty,
                    'entitySubscriberProperty',
                  )
                  .select(
                    (qb) =>
                      qb
                        .from(PropertyType, 'propertyType')
                        .select('propertyType.name', 'propertyTypeName')
                        .where(
                          'propertyType.id = "entitySubscriberProperty"."propertyTypeId"',
                        ),
                    'propertyTypeName',
                  )
                  .where(
                    'entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"',
                  )
                  .getSql()}) as "subQuery"),
              'propertyTypeUnitPrice', (select "subQuery"."unitPrice" from (${this.dbManager
                .createQueryBuilder(
                  EntitySubscriberProperty,
                  'entitySubscriberProperty',
                )
                .select(
                  (qb) =>
                    qb
                      .from(PropertyType, 'propertyType')
                      .select('propertyType.unitPrice', 'unitPrice')
                      .where(
                        'propertyType.id = "entitySubscriberProperty"."propertyTypeId"',
                      ),
                  'unitPrice',
                )
                .where(
                  'entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"',
                )
                .getSql()}) as "subQuery")
              ))
              `,
              'propertyUnits',
            )
            .where(
              'propertySubscriptionUnit.propertySubscriptionId = "propertySubscription"."id"',
            );
        }, 'propertyUnits')
        .addSelect(
          (qb) =>
            qb
              .from(Payment, 'payment')
              .select('payment.amount')
              .where(
                'payment.propertySubscriptionId = "propertySubscription"."id"',
              )
              .orderBy('payment.createdAt', 'DESC')
              .limit(1),
          'lastPayment',
        )
        .addSelect(
          (qb) =>
            qb
              .from(VirtualAccountDetail, 'virtualAccountDetail')
              .select(
                `json_agg(json_build_object('account_name', "virtualAccountDetail"."account_name", 'account_number', "virtualAccountDetail"."account_number"))`,
              )
              .where(
                'virtualAccountDetail.propertySubscriptionId = "propertySubscription"."id"',
              ),
          'subscriberVirtualAccountDetails',
        )
        .where(
          `${'propertySubscription.streetId = :streetId'} ${
            !!propertySubscriptionId !== false
              ? 'and propertySubscription.id = :propertySubscriptionId'
              : ''
          }`,
          {
            streetId,
            billingMonth,
            ...(!!propertySubscriptionId !== false
              ? { propertySubscriptionId }
              : {}),
          },
        )
        .getRawMany();
    }

    return billingDetails
      .filter((billing) => !!billing.currentBillingId)
      .map((result) => {
        result['currentBilling'] = result['currentBilling'] || '0';
        return pick(result, [
          'streetName',
          'propertySubscriptionId',
          'propertyName',
          'arrears',
          'currentBilling',
          'currentBillingId',
          'totalBilling',
          'lastPayment',
          'propertyUnits',
          'streetNumber',
          'subscriberVirtualAccountDetails',
        ]);
      }) as unknown as {
      streetName: string;
      PropertySubscriptionId: string;
      propertyName: string;
      currentBilling: string;
      currentBillingId: string;
      arrears: number;
      totalBilling?: string;
    }[];
  }

  async getDashboardMetrics(entityProfileId: string) {
    // get number of streets
    // get number of subscribers
    // get number of properties

    const dashboardMetrics = {
      streetCount: 0,
      subscriberCount: 0,
      properitesCount: 0,
      totalBillings: 0,
      totalPayments: 0,
      billingAcrossMonths: [],
      paymentsAcrossMonths: [],
    };

    try {
      dashboardMetrics.streetCount = await this.dbManager.count(Street, {
        where: {
          entityProfileId,
        },
      });
    } catch (err) {
      Logger.log('An error occured while calculating street count', err);
    }

    try {
      dashboardMetrics.subscriberCount = await this.dbManager.count(
        PropertySubscription,
        {
          where: {
            entityProfileId,
          },
        },
      );
    } catch (err) {
      Logger.log('An error occured while calculating subscriber count', err);
    }

    try {
      dashboardMetrics.properitesCount = await this.dbManager.count(
        PropertySubscriptionUnit,
        {
          where: {
            propertySubscription: {
              entityProfileId,
            },
          },
        },
      );
    } catch (err) {
      Logger.log('An error occured while calculating properites count', err);
    }

    // get total billings
    // get total payments
    const month = MonthNames[new Date().getMonth() + 1];
    try {
      const billingAcrossMonths = await this.dbManager.find(Billing, {
        where: {
          propertySubscription: {
            entityProfileId,
          },
          year: new Date().getFullYear().toString(),
        },
      });

      dashboardMetrics.totalBillings = billingAcrossMonths.reduce(
        (acc, curr) => {
          dashboardMetrics.billingAcrossMonths.push({
            month: curr.month,
            amount: curr.amount,
          });
          return bignumber(acc).add(curr.amount).toNumber();
        },
        0,
      );
    } catch (err) {
      Logger.log('An error occured while calculating total billings', err);
    }

    try {
      const paymentsAcrossMonths = await this.dbManager.find(Payment, {
        where: {
          propertySubscription: {
            entityProfileId,
          },
          createdAt: Raw(($alias) => `extract(month from ${$alias}) = :month`, {
            month: this.getMonthNumber(month),
          }),
        },
      });

      dashboardMetrics.totalPayments = paymentsAcrossMonths.reduce(
        (acc, curr) => {
          dashboardMetrics.paymentsAcrossMonths.push({
            month: this.getMonthName(new Date().getMonth() + 1),
            amount: curr.amount,
          });
          return bignumber(acc).add(curr.amount).toNumber();
        },
        0,
      );
    } catch (err) {
      Logger.log('An error occured while calculating total payments', err);
    }

    return dashboardMetrics;
  }

  async postPayment(postPaymentDto: PostPaymentDto, entityProfileId: string) {
    //
    await this.dbManager.transaction(async (transactionManager) => {
      await this.createNewPayment({
        ...postPaymentDto,
        dbManager: transactionManager,
        entityProfileId,
      });
    });
  }

  getMonthNumber(monthName: string) {
    const monthNumber = Object.values(MonthNames).indexOf(monthName) + 1;
    return monthNumber;
  }

  async getPayments({
    propertySubscriptionId,
    entityProfileId,
    year = new Date().getFullYear().toString(),
    month,
  }: {
    propertySubscriptionId?: string;
    entityProfileId: string;
    year?: string;
    month?: string;
  }) {
    //

    let payments: Payment[] = [];
    if (month && year) {
      payments = await this.dbManager.find(Payment, {
        where: {
          ...(propertySubscriptionId ? { propertySubscriptionId } : {}),
          paymentDate: Raw(
            ($alias) => `extract(month from ${$alias}) = :month`,
            {
              month: this.getMonthNumber(month),
            },
          ),
          createdAt: Raw(($alias) => `extract(year from ${$alias}) = :year`, {
            year: parseInt(year),
          }),
          propertySubscription: {
            entityProfileId: entityProfileId,
          },
        },
        relations: {
          propertySubscription: true,
        },

        order: {
          createdAt: 'DESC',
        },
      });
    } else {
      payments = await this.dbManager.find(Payment, {
        where: {
          ...(propertySubscriptionId ? { propertySubscriptionId } : {}),
          propertySubscription: {
            entityProfileId: entityProfileId,
          },
          ...(year
            ? {
                createdAt: Raw(
                  ($alias) => `extract(year from ${$alias}) = :year`,
                  {
                    year: parseInt(year),
                  },
                ),
              }
            : {}),
        },
        relations: {
          propertySubscription: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      propertySubscriptionId: payment.propertySubscriptionId,
      payerName: payment.payerName,
      year: new Date(payment.paymentDate).getFullYear().toString(),
      month: MonthNames[new Date(payment.paymentDate).getMonth() + 1],
      propertySubscriptionName:
        payment.propertySubscription.propertySubscriptionName,
      createdAt: payment.createdAt,
      comments: payment.comments,
    }));
  }

  async deletePayment(paymentId: string, entityProfileId: string) {
    // First, find the payment and verify it belongs to the entity
    const payment = await this.dbManager.findOne(Payment, {
      where: {
        id: paymentId,
        propertySubscription: {
          entityProfileId: entityProfileId,
        },
      },
      relations: {
        propertySubscription: {
          billingAccount: true,
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found or unauthorized');
    }

    await this.dbManager.transaction(async (transactionManager) => {
      // Update billing account - subtract the deleted payment amount from totalPayments
      const billingAccount = payment.propertySubscription.billingAccount;
      const updatedTotalPayments = bignumber(billingAccount.totalPayments)
        .minus(payment.amount)
        .toNumber();

      // Ensure totalPayments doesn't go below 0
      billingAccount.totalPayments = String(Math.max(0, updatedTotalPayments));

      // Save the updated billing account
      await transactionManager.save(billingAccount);

      // Perform soft delete of the payment
      await transactionManager.delete(Payment, paymentId);
    });
  }

  private escapeCSVField(field: any): string {
    const stringField = String(field || '');
    // Escape commas and quotes in CSV fields
    if (
      stringField.includes(',') ||
      stringField.includes('"') ||
      stringField.includes('\n')
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }

  private generatePaymentsCSV(
    payments: Payment[],
    options?: {
      includeSummary?: boolean;
      summaryPeriod?: string;
    },
  ): string {
    const csvHeaders = [
      'Payment ID',
      'Payer Name',
      'Payment Date',
      'Amount (₦)',
      'Property Name',
      'Street Name',
      'Subscriber Name',
      'Subscriber Phone',
      'Comments',
      'Created At',
    ];

    const csvRows = payments.map((payment) => [
      payment.id,
      payment.payerName || '',
      new Date(payment.paymentDate).toLocaleDateString('en-US'),
      payment.amount,
      payment.propertySubscription?.propertySubscriptionName || '',
      payment.propertySubscription?.street?.name || '',
      `${
        payment.propertySubscription?.entitySubscriberProfile?.firstName || ''
      } ${
        payment.propertySubscription?.entitySubscriberProfile?.lastName || ''
      }`.trim(),
      payment.propertySubscription?.entitySubscriberProfile?.phone || '',
      payment.comments || '',
      new Date(payment.createdAt).toLocaleString('en-US'),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((field) => this.escapeCSVField(field)).join(','),
      ),
    ];

    // Add summary if requested
    if (options?.includeSummary) {
      const totalAmount = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0,
      );
      const summaryRow = [
        '',
        '',
        '',
        `TOTAL: ${totalAmount.toFixed(2)}`,
        `Count: ${payments.length} payments`,
        options.summaryPeriod || '',
        '',
        '',
        '',
        '',
      ];

      csvContent.push(''); // Empty row before summary
      csvContent.push(
        summaryRow.map((field) => this.escapeCSVField(field)).join(','),
      );
    }

    return csvContent.join('\n');
  }

  async getDailyPaymentsCSV(date: string, entityProfileId: string) {
    // Validate date format
    if (!date || isNaN(Date.parse(date))) {
      throw new Error(
        'Invalid date format. Please provide a valid date (YYYY-MM-DD).',
      );
    }

    // Parse the date and get all payments for that day
    const payments = await this.dbManager.find(Payment, {
      where: {
        paymentDate: Raw(($alias) => `DATE(${$alias}) = :date`, { date }),
        propertySubscription: {
          entityProfileId: entityProfileId,
        },
      },
      relations: {
        propertySubscription: {
          street: true,
          entitySubscriberProfile: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return this.generatePaymentsCSV(payments);
  }

  async getDateRangePaymentsCSV(
    startDate: string,
    endDate: string,
    entityProfileId: string,
  ) {
    // Validate date format
    if (!startDate || isNaN(Date.parse(startDate))) {
      throw new Error(
        'Invalid start date format. Please provide a valid date (YYYY-MM-DD).',
      );
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
      throw new Error(
        'Invalid end date format. Please provide a valid date (YYYY-MM-DD).',
      );
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('Start date cannot be after end date.');
    }

    // Get all payments within the date range
    const payments = await this.dbManager.find(Payment, {
      where: {
        paymentDate: Raw(
          ($alias) => `DATE(${$alias}) BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        ),
        propertySubscription: {
          entityProfileId: entityProfileId,
        },
      },
      relations: {
        propertySubscription: {
          street: true,
          entitySubscriberProfile: true,
        },
      },
      order: {
        paymentDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    return this.generatePaymentsCSV(payments, {
      includeSummary: true,
      summaryPeriod: `Period: ${startDate} to ${endDate}`,
    });
  }

  async createStreet(
    createStreetDto: CreateStreetDto,
    authPayload: AuthTokenPayload,
  ) {
    const entityProfileId = authPayload.profile.entityProfileId;
    const lgaWardId = createStreetDto.lgaWardId;

    // check if street with name already exists
    let street = await this.dbManager.findOne(Street, {
      where: {
        name: ILike(`%${createStreetDto.name}%`),
        lgaWardId,
        entityProfileId,
      },
    });

    if (!street) {
      // street does not exist, create new street

      // verify lgaWard and lga exist
      await this.getLgaWardOrThrowError({
        lgaWardId,
      });

      street = this.dbManager.create(Street, {
        name: createStreetDto.name,
        lgaWardId,
        entityProfileId,
      });

      await this.dbManager.save(street);
    }

    return street;
  }

  async createLgaWard(createLgaWardDto: CreateLgaWardDto) {
    await this.getLgaOrThrowError({ lgaId: createLgaWardDto.lgaId });
    const lgaId = createLgaWardDto.lgaId;

    // verify lgaWard does not already exist
    let lgaWard = await this.getLgaWardOrThrowError({
      name: ILike(`%${createLgaWardDto.name}%`),
      throwError: false,
    });

    if (!lgaWard) {
      lgaWard = this.dbManager.create(LgaWard, {
        name: createLgaWardDto.name,
        lgaId,
      });

      lgaWard = await this.dbManager.save(lgaWard);
    }
    return lgaWard;
  }

  async createLga(createLgaDto: CreateLgaDto) {
    // verify lga does not exist
    let lga = await this.getLgaOrThrowError({
      name: ILike(`%${createLgaDto.name}%`),
      throwError: false,
    });

    if (!lga) {
      lga = this.dbManager.create(Lga, {
        name: createLgaDto.name,
      });

      await this.dbManager.save(lga);
    }

    return lga;
  }

  async getLgas(query?: string) {
    const lgas = query
      ? await this.dbManager.find(Lga, {
          where: {
            name: ILike(`%${query}%`),
          },
        })
      : await this.dbManager.find(Lga);

    return lgas;
  }

  async getLgaWards({ query, lgaId }: { query?: string; lgaId?: string }) {
    const lgaWards =
      query || lgaId
        ? await this.dbManager.find(LgaWard, {
            where: {
              ...(query ? { name: ILike(`%${query}%`) } : {}),
              ...(lgaId ? { lgaId } : {}),
            },
          })
        : await this.dbManager.find(LgaWard);
    return lgaWards;
  }

  async getStreets(
    entityProfileId: string,
    { query, lgaWardId }: { query?: string; lgaWardId?: string },
  ) {
    const streets =
      query || lgaWardId
        ? await this.dbManager.find(Street, {
            where: {
              ...(query ? { name: ILike(`%${query}%`) } : {}),
              ...(lgaWardId ? { lgaWardId } : {}),
              entityProfileId,
            },
          })
        : await this.dbManager.find(Street, {
            where: {
              entityProfileId,
            },
          });
    return streets;
  }

  async getPhoneCode({
    query,
    phoneCodeId,
  }: { query?: string; phoneCodeId?: string } = {}) {
    if (phoneCodeId) {
      const phoneCode = await this.dbManager.findOne(PhoneCode, {
        where: { id: phoneCodeId },
      });

      return phoneCode;
    }

    const phoneCodes = query
      ? await this.dbManager.find(PhoneCode, {
          where: {
            name: ILike(`%${query}%`),
          },
        })
      : await this.dbManager.find(PhoneCode);

    return phoneCodes;
  }

  //
  async getPhoneCodeOrThrow({
    phoneCodeId,
    name,
    throwError = true,
  }: { phoneCodeId?: string; name?: string; throwError?: boolean } = {}) {
    const phoneCode = await this.dbManager.findOne(PhoneCode, {
      where: {
        ...(phoneCodeId ? { id: phoneCodeId } : { name: ILike(`%${name}%`) }),
      },
    });

    throwError = !phoneCode && throwError;
    if (throwError) {
      throwBadRequest('Phone code not found.');
    }
    return phoneCode;
  }

  async getLgaWardOrThrowError({
    name,
    lgaWardId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    lgaWardId?: string;
    throwError?: boolean;
  }) {
    const lgaWard = await this.dbManager.findOne(LgaWard, {
      where: {
        ...(name ? { name } : { id: lgaWardId }),
      },
    });

    throwError = !lgaWard && throwError;
    if (throwError) {
      throwBadRequest('Lga ward not found.');
    }

    return lgaWard;
  }

  async getLgaOrThrowError({
    name,
    lgaId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    lgaId?: string;
    throwError?: boolean;
  }) {
    const lga = await this.dbManager.findOne(Lga, {
      where: {
        ...(name ? { name } : { id: lgaId }),
      },
    });

    throwError = !lga && throwError;
    if (throwError) {
      throwBadRequest('Lga not found.');
    }

    return lga;
  }

  getMonthName(month?: number) {
    if (!month) {
      month = new Date().getMonth() + 1;
    }

    return MonthNames[month];
  }

  async validateEntitySubscriberProfileById(
    propertySubscriberProfileId: string,
  ) {
    const propertySubscriberProfile = await this.dbManager.findOne(
      EntitySubscriberProfile,
      {
        where: {
          id: propertySubscriberProfileId,
        },
      },
    );

    if (!propertySubscriberProfile) {
      throwBadRequest('Reference to subscriber is invalid.');
    }

    return !!propertySubscriberProfile;
  }

  async getPropertyTypeOrThrowError({
    name,
    propertyTypeId,
    unitPrice,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    propertyTypeId?: string;
    unitPrice?: string;
    throwError?: boolean;
  }) {
    const propertyType = await this.dbManager.findOne(PropertyType, {
      where: {
        ...(name ? { name, unitPrice } : { id: propertyTypeId }),
      },
    });

    throwError = !propertyType && throwError;
    if (throwError) {
      throwBadRequest('Reference to property type is invalid.');
    }

    return propertyType;
  }

  async getStreetOrThrowError({
    name,
    streetId,
    entityProfileId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    streetId?: string;
    entityProfileId?: string;
    throwError?: boolean;
  }) {
    const street = await this.dbManager.findOne(Street, {
      where: {
        ...(name ? { name } : { id: streetId }),
        ...(entityProfileId ? { entityProfileId } : {}),
      },
    });

    throwError = !street && throwError;
    if (throwError) {
      throwBadRequest('Reference to street is invalid.');
    }

    return street;
  }

  async createNewPayment({
    dbManager,
    comments,
    propertySubscriptionId,
    amount,
    payerName,
    paymentDate,
    entityProfileId,
  }: {
    amount: string;
    payerName: string;
    paymentDate: string | Date;
    propertySubscriptionId: string;
    dbManager: EntityManager;
    comments?: string;
    entityProfileId?: string;
  }) {
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertySubscriptionId,
          ...(entityProfileId ? { entityProfileId } : {}),
        },
        relations: {
          billingAccount: true,
        },
      },
    );

    if (!propertySubscription) {
      throwBadRequest('Property subscription not found.');
    }

    const billingAccount = propertySubscription.billingAccount;
    const totalPayments = bignumber(billingAccount.totalPayments)
      .add(amount)
      .toNumber();

    billingAccount.totalPayments = String(totalPayments);
    let newPayment = dbManager.create(Payment, {
      amount,
      payerName,
      propertySubscriptionId,
      paymentDate: paymentDate as string,
      comments,
    });

    newPayment = await dbManager.save(newPayment);
    await dbManager.save(billingAccount);
    return newPayment;
  }

  // webhook handles
  async handleWebhookEvent({
    eventData,
    webhookSignature,
  }: {
    eventData: PaystackWebhookEventObject;
    webhookSignature: string;
  }) {
    // validate webhook event data
    const isValid = await this.paystackService.validatePaystackWebhookEvent(
      webhookSignature,
      eventData,
    );
    // if (!isValid) {
    //   return;
    // }

    switch (eventData.event) {
      case 'charge.success':
        await this.chargeSuccess(eventData.data);
        break;
      case 'dedicatedaccount.assign.success':
        await this.DVASucess(eventData.data, this.dbManager);
        break;
      case 'transfer.success':
        await this.transferSuccess(eventData.data);
        break;
      case 'transfer.failed':
      case 'transfer.reversed':
        await this.transferFailedOrReversed(eventData.data);
    }
  }
  private async chargeSuccess(data: PaystackWebhookData) {
    // process virtual account payment
    const isVirtualBankAccountPayment =
      this.paystackService.checkIsVirtualBankAccoountPayment(data);
    if (isVirtualBankAccountPayment) {
      // check if payment is already processed
      const virtualAccountReceivedPament = await this.dbManager.findOne(
        VirtualAccountReceivedPayment,
        {
          where: {
            paymentReference: data.reference,
          },
        },
      );

      if (virtualAccountReceivedPament) {
        return; // Exit if payment is already processed
      }

      // fetch payer's record
      const payingSubscriberAccountDetail = await this.dbManager.findOne(
        VirtualAccountDetail,
        {
          where: {
            account_number: data.authorization.receiver_bank_account_number,
          },
          relations: {
            propertySubscription: {
              entitySubscriberProfile: {
                phoneCode: true,
              },
              street: true,
            },
          },
        },
      );

      const koboFactor = 100;
      const paymentAmount = String(data.amount / koboFactor);

      await this.dbManager.transaction(async (transactionManager) => {
        const newPayment = await this.createNewPayment({
          dbManager: transactionManager,
          comments: 'Bank Transfer Automation',
          amount: paymentAmount,
          paymentDate: new Date(),
          propertySubscriptionId:
            payingSubscriberAccountDetail.propertySubscriptionId,
          payerName:
            payingSubscriberAccountDetail.propertySubscription
              ?.propertySubscriptionName ||
            payingSubscriberAccountDetail.account_name,
        });

        // add payment to operator's wallet
        const adminUser = await transactionManager.findOne(ProfileCollection, {
          where: {
            profileType: ProfileTypes.ENTITY_USER_PROFILE,
            isAdmin: true,
            profileTypeId:
              payingSubscriberAccountDetail.propertySubscription
                .entityProfileId,
          },
        });

        const adminUserId = adminUser.userId;
        // check if operator has a wallet, else create a new wallet
        let operatorsWalletRef = await transactionManager.findOne(
          WalletReference,
          {
            where: {
              authenticatedUserId: adminUserId,
              isCompanyWallet: true,
            },
          },
        );

        // credit operator's wallet
        const walletRef = operatorsWalletRef?.publicReference;
        if (!walletRef) {
          // create new wallet
          operatorsWalletRef = await this.walletService.createWallet({
            user_id: adminUserId,
            dbManager: transactionManager,
          });
        }

        // deduct Paystack fees
        const paystackFees = data.fees as number;
        const chargedAmount = data.amount;

        // deduct boundless fees
        const boundelsssDeductionPercentage = 0.05; // 5%
        const boundelsssDeductionPercentageAmount =
          boundelsssDeductionPercentage * chargedAmount;

        const boundlessDeductionMinimumAmount = 10000;

        const currencyDenominator = 100;
        const boundlessDeductionCap = 1000; // in Naira
        const boundelsssDeductionMaxAmount =
          boundlessDeductionCap * currencyDenominator;
        const boundlessDeduction = Math.max(
          Math.min(
            boundelsssDeductionPercentageAmount,
            boundelsssDeductionMaxAmount,
          ),
          boundlessDeductionMinimumAmount,
        );

        const amountToCreditOperator =
          chargedAmount - (paystackFees + boundlessDeduction);

        // credit wallet
        await this.walletService.transactOperatorWallet({
          public_id: operatorsWalletRef.publicReference,
          user_id: operatorsWalletRef.authenticatedUserId,
          amount: String(amountToCreditOperator),
          credit_source_data: JSON.stringify({ PAYSTACK: data }),
          type: Wallet_Service_Transaction_Type.CREDIT,
        });

        // transfer fund to operator bank account
        const entityProfileBankAccountDetail = await this.dbManager.findOne(
          EntityProfileBankAccountDetails,
          {
            where: {
              entityProfileId:
                payingSubscriberAccountDetail.propertySubscription
                  .entityProfileId,
            },
          },
        );

        if (entityProfileBankAccountDetail) {
          // make transfer
          const trnasferReference = v4();

          try {
            // Step 1: Check Paystack balance
            const balanceResponse = await this.paystackService.checkBalance();
            const availableBalance =
              balanceResponse.find((b) => b.currency === 'NGN')?.balance || 0;

            if (availableBalance >= amountToCreditOperator) {
              // Step 2: Initiate transfer to entity operator's account

              await this.paystackService.makeTransfer({
                amount: amountToCreditOperator,
                account_number: entityProfileBankAccountDetail.accountNumber,
                bank_code: entityProfileBankAccountDetail.bankCode,
                name: entityProfileBankAccountDetail.accountName,
                currency: entityProfileBankAccountDetail.currency,
                reference: trnasferReference,
              });

              // Step 3: Add pending wallet transaction
              const pendingWalletTransaction = new PendingWalletTransaction();
              pendingWalletTransaction.amount = String(amountToCreditOperator);
              pendingWalletTransaction.walletReference =
                operatorsWalletRef.publicReference;
              pendingWalletTransaction.type =
                Wallet_Service_Transaction_Type.DEBIT;
              pendingWalletTransaction.sourcePaymentReference =
                trnasferReference;
              pendingWalletTransaction.userId =
                operatorsWalletRef.authenticatedUserId;

              pendingWalletTransaction.creditSourceData = JSON.stringify({
                PAYSTACK: data,
              });

              await transactionManager.save(pendingWalletTransaction);

              // Step 4: Mark webhook data as received
              await this.dbManager.save(
                this.dbManager.create(VirtualAccountReceivedPayment, {
                  paymentReference: data.reference,
                  entityProfileId:
                    payingSubscriberAccountDetail.propertySubscription
                      .entityProfileId,
                  virtualAccountDetailId: payingSubscriberAccountDetail.id,
                }),
              );
            } else {
              throw new Error(
                'Insufficient balance on Paystack to complete transfer',
              );
            }
          } catch (error) {
            // debit wallet if transfer fails
            await this.walletService.transactOperatorWallet({
              public_id: operatorsWalletRef.publicReference,
              user_id: operatorsWalletRef.authenticatedUserId,
              amount: String(amountToCreditOperator),
              credit_source_data: JSON.stringify({ PAYSTACK: data }),
              type: Wallet_Service_Transaction_Type.DEBIT,
            });
            // log error
            Logger.log(error);
            // throw error
            throw new Error('Could not complete process');
          }
        } else {
          // TODO: Handle case where entity operator's bank account details are missing
        }
      });

      // Send notifications AFTER transaction completes successfully
      // This is fire-and-forget to prevent notification failures from affecting payment processing
      this.sendPaymentNotifications(
        payingSubscriberAccountDetail,
        paymentAmount,
        data.reference,
      ).catch((notificationError) => {
        // Log error but don't throw - notifications are non-critical
        Logger.error(
          'Non-critical error sending payment notifications:',
          notificationError,
        );
      });
    } else {
      // TODO: Handle case for non-virtual account payments
    }
  }
  /**
   * Send payment notifications to customer and admin operators
   * This is completely isolated from payment processing to prevent failures
   */
  private async sendPaymentNotifications(
    payingSubscriberAccountDetail: VirtualAccountDetail & {
      propertySubscription: PropertySubscription & {
        entitySubscriberProfile?: EntitySubscriberProfile & {
          phoneCode?: PhoneCode;
        };
        street?: Street;
      };
    },
    paymentAmount: string,
    paymentReference: string,
  ): Promise<void> {
    try {
      const subscriber =
        payingSubscriberAccountDetail.propertySubscription
          ?.entitySubscriberProfile;
      const street = payingSubscriberAccountDetail.propertySubscription?.street;
      const entityProfileId =
        payingSubscriberAccountDetail.propertySubscription?.entityProfileId;

      if (!entityProfileId) {
        Logger.warn('Cannot send notifications: entityProfileId is missing');
        return;
      }

      const propertyAddress = `${
        payingSubscriberAccountDetail.propertySubscription?.streetNumber || ''
      } ${street?.name || 'Unknown Street'}`.trim();

      // Step 1: Send notification to customer (if subscriber exists)
      if (subscriber) {
        try {
          // Combine phone code and phone number
          const fullPhoneNumber =
            subscriber.phoneCode && subscriber.phone
              ? `+${subscriber.phoneCode.name}${subscriber.phone}`
              : subscriber.phone;

          await this.notificationService.queuePaymentNotification({
            recipientPhone: fullPhoneNumber,
            recipientEmail: subscriber.email,
            recipientName: `${subscriber.firstName} ${subscriber.lastName}`,
            amount: parseFloat(paymentAmount),
            reference: paymentReference,
            propertyAddress,
            entityProfileId,
            isForOperator: false,
          });

          Logger.log(
            `[Payment Notification] Queued for customer: ${subscriber.firstName} ${subscriber.lastName}`,
          );
        } catch (customerNotificationError) {
          Logger.error(
            '[Payment Notification] Failed to queue customer notification:',
            customerNotificationError,
          );
          // Continue to admin notifications even if customer notification fails
        }
      }

      // Step 2: Send notifications to admin operators
      try {
        // Fetch all admin users for this entity
        const adminProfiles = await this.dbManager.find(ProfileCollection, {
          where: {
            profileType: ProfileTypes.ENTITY_USER_PROFILE,
            isAdmin: true,
            profileTypeId: entityProfileId,
          },
        });

        if (!adminProfiles || adminProfiles.length === 0) {
          Logger.warn(
            `[Payment Notification] No admin users found for entity: ${entityProfileId}`,
          );
          return;
        }

        const customerName = subscriber
          ? `${subscriber.firstName} ${subscriber.lastName}`
          : payingSubscriberAccountDetail.account_name || 'Unknown Customer';

        // Queue email notifications to all admin users
        for (const adminProfile of adminProfiles) {
          try {
            // Fetch the entity user profile details
            const entityUserProfile = await this.dbManager.findOne(
              EntityUserProfile,
              {
                where: { id: adminProfile.profileTypeId },
              },
            );

            if (entityUserProfile?.email) {
              await this.notificationService.queuePaymentNotification({
                recipientPhone: null, // Admin doesn't need SMS
                recipientEmail: entityUserProfile.email,
                recipientName: customerName,
                amount: parseFloat(paymentAmount),
                reference: paymentReference,
                propertyAddress,
                entityProfileId,
                isForOperator: true,
                operatorName: entityUserProfile.firstName
                  ? `${entityUserProfile.firstName} ${
                      entityUserProfile.lastName || ''
                    }`
                  : 'Admin',
              });

              Logger.log(
                `[Payment Notification] Queued for admin: ${entityUserProfile.email}`,
              );
            }
          } catch (singleAdminError) {
            Logger.error(
              `[Payment Notification] Failed to queue for admin ${adminProfile.id}:`,
              singleAdminError,
            );
            // Continue with next admin even if one fails
          }
        }
      } catch (adminNotificationError) {
        Logger.error(
          '[Payment Notification] Failed to queue admin notifications:',
          adminNotificationError,
        );
      }
    } catch (error) {
      // Catch-all to ensure no error escapes
      Logger.error(
        '[Payment Notification] Unexpected error in notification process:',
        error,
      );
    }
  }

  private async transferSuccess(data: PaystackWebhookData) {
    const transferReference = data.reference;
    const pendingTransaction = await this.dbManager.findOne(
      PendingWalletTransaction,
      {
        where: { sourcePaymentReference: transferReference },
      },
    );

    if (!pendingTransaction) {
      Logger.warn(
        `Pending transaction not found for reference: ${transferReference}`,
      );
      return;
    }

    try {
      // 2. Process the wallet transaction
      await this.walletService.transactOperatorWallet({
        public_id: pendingTransaction.walletReference,
        user_id: pendingTransaction.userId,
        amount: pendingTransaction.amount,
        credit_source_data: pendingTransaction.creditSourceData,
        type: pendingTransaction.type as Wallet_Service_Transaction_Type,
      });

      // 3. Clean up pending transaction
      await this.dbManager.delete(PendingWalletTransaction, {
        id: pendingTransaction.id,
      });

      // TODO: send sms to company
    } catch (error) {
      Logger.error(
        `[Transfer Success] Failed to process transfer success: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async transferFailedOrReversed(data: PaystackWebhookData) {
    const transferReference = data.reference;
    const associatedPendingWalletTransaction = await this.dbManager.findOne(
      PendingWalletTransaction,
      {
        where: {
          sourcePaymentReference: transferReference,
        },
      },
    );

    await this.dbManager.delete(PendingWalletTransaction, {
      id: associatedPendingWalletTransaction.id,
    });
  }

  private async DVASucess(data: PaystackWebhookData, dbManager: EntityManager) {
    // fetch payers record
    const dvaVirtualAccountDetail = await dbManager.findOne(
      VirtualAccountDetail,
      {
        where: {
          email: data.customer.email,
        },
        relations: {
          propertySubscription: true,
        },
      },
    );

    if (dvaVirtualAccountDetail) {
      // update dva virtual account detail
      dvaVirtualAccountDetail.account_name =
        data.dedicated_account.account_name;
      dvaVirtualAccountDetail.account_number =
        data.dedicated_account.account_number;
      dvaVirtualAccountDetail.bank = data.dedicated_account.bank.slug;

      await this.dbManager.save(dvaVirtualAccountDetail);
    }
  }

  //getOperatorMetrics

  async getOperatorMetrics(entityProfileId: string) {
    const operatorMetrics = {
      operatorCount: 0,
    };
    try {
      operatorMetrics.operatorCount = await this.dbManager.count(
        EntityUserProfile,
        {
          where: {
            entityProfileId,
          },
        },
      );
    } catch (err) {
      Logger.log(
        'An error occurred while calculating total operator count',
        err,
      );
    }
    return operatorMetrics;
  }
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendBillingSmsNotifications() {
    const today = new Date();
    if (today.getDate() === 25) {
      try {
        // Fetch all property subscriptions with their related entities
        const propertySubscriptions = await this.dbManager.find(
          PropertySubscription,
          {
            relations: ['entitySubscriberProfile', 'billings'],
          },
        );

        // Send SMS notifications to each subscriber
        await Promise.all(
          propertySubscriptions.map(async (subscription) => {
            // Get the entity subscriber details
            const subscriber = subscription.entitySubscriberProfile;
            const subscriberName = `${subscriber.firstName} ${subscriber.lastName}`;
            const subscriberPhone = subscriber.phone;

            // Get the latest billing for the current month and year
            const currentMonth = getCurrentMonth();
            const currentYear = getCurrentYear();
            const latestBilling = subscription.billings.find(
              (billing) =>
                billing.month === currentMonth && billing.year === currentYear,
            );

            if (!latestBilling) {
              Logger.warn(
                `No billing found for subscription ${subscription.id} for ${currentMonth} ${currentYear}.`,
              );
              return;
            }

            // Generate the SMS message
            const smsMessage = generateBillingSmsMessage(
              subscriberName,
              currentMonth,
              currentYear,
              latestBilling.amount,
            );

            // Send the SMS
            const termiiSms = {
              to: subscriberPhone,
              sms: smsMessage,
            };

            await this.sharedService.sendTermiiSms(termiiSms);
          }),
        );
      } catch (error) {
        Logger.error('Error sending SMS notifications:', error);
      }
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateBillingsForAllEntitySubscribers() {
    const today = new Date();
    this.logger.log(
      `[Billing Cron] Starting daily billing check - Date: ${today.toISOString()}, Day: ${today.getDate()}`,
    );

    if (today.getDate() === 25) {
      this.logger.log(
        '[Billing Cron] Date is 25th - proceeding with billing generation',
      );
      try {
        // Fetch all entity profiles with auto-generation enabled
        const entityProfiles = await this.dbManager.find(EntityProfile, {
          relations: ['entityProfilePreference'],
        });

        this.logger.log(
          `[Billing Cron] Found ${entityProfiles.length} entity profiles`,
        );

        // Filter entities with auto-generation enabled
        const enabledEntityProfiles = entityProfiles.filter(
          (profile) => profile.entityProfilePreference?.autoGenerateBills,
        );

        this.logger.log(
          `[Billing Cron] ${enabledEntityProfiles.length} entities have auto-generation enabled`,
        );

        // Process each entity
        for (const entityProfile of enabledEntityProfiles) {
          this.logger.log(
            `[Billing Cron] Processing entity: ${entityProfile.name} (ID: ${entityProfile.id})`,
          );
          try {
            // Get all property subscriptions for this entity
            const propertySubscriptions = await this.dbManager.find(
              PropertySubscription,
              {
                where: {
                  entityProfileId: entityProfile.id,
                  isBillingActive: true, // Only generate for active subscriptions
                  deletedAt: IsNull(), // Exclude deleted subscriptions
                },
                relations: {
                  entitySubscriberProfile: {
                    phoneCode: true,
                  },
                  street: true,
                },
              },
            );

            this.logger.log(
              `[Billing Cron] Found ${propertySubscriptions.length} active property subscriptions for ${entityProfile.name}`,
            );

            // Generate billings in a transaction
            await this.dbManager.transaction(async (transactionManager) => {
              const generatedBillings = [];

              for (const subscription of propertySubscriptions) {
                try {
                  const billing = await this.generateMonthBilling(
                    subscription.id,
                    getCurrentMonth(),
                    {
                      year: getCurrentYear(),
                      throwError: false,
                      transactionManager,
                    },
                  );

                  if (billing) {
                    generatedBillings.push({
                      billing,
                      subscription,
                    });
                  }
                } catch (error) {
                  Logger.warn(
                    `Failed to generate billing for subscription ${subscription.id}: ${error.message}`,
                  );
                }
              }

              // Queue SMS notifications for generated billings
              if (generatedBillings.length > 0) {
                Logger.log(
                  `[Billing Cron] Successfully generated ${generatedBillings.length} billings for ${entityProfile.name}`,
                );

                // Send notifications asynchronously
                this.queueBillingNotifications(
                  generatedBillings,
                  entityProfile,
                ).catch((error) => {
                  Logger.error(
                    `[Billing Cron] Error queuing notifications for ${entityProfile.name}: ${error.message}`,
                  );
                });
              } else {
                this.logger.log(
                  `[Billing Cron] No new billings generated for ${entityProfile.name}`,
                );
              }
            });
          } catch (error) {
            Logger.error(
              `[Billing Cron] Error processing entity ${entityProfile.name}: ${error.message}`,
              error.stack,
            );
          }
        }
        this.logger.log('[Billing Cron] Completed billing generation process');
      } catch (error) {
        Logger.error(
          '[Billing Cron] Error generating billings:',
          error.message,
          error.stack,
        );
      }
    } else {
      this.logger.log(
        `[Billing Cron] Skipping - not the 25th (current day: ${today.getDate()})`,
      );
    }
  }

  private async queueBillingNotifications(
    generatedBillings: Array<{
      billing: any;
      subscription: PropertySubscription;
    }>,
    entityProfile: EntityProfile,
  ) {
    for (const { billing, subscription } of generatedBillings) {
      try {
        // Get subscriber details
        const subscriber = subscription.entitySubscriberProfile;

        if (!subscriber) {
          Logger.warn(
            `[Billing Notification] No subscriber found for subscription ${subscription.id}`,
          );
          continue;
        }

        // Get property address
        const street =
          subscription.street ||
          (await this.dbManager.findOne(Street, {
            where: { id: subscription.streetId },
          }));
        const propertyAddress = `${subscription.streetNumber || ''} ${
          street?.name || 'Unknown Street'
        }`.trim();

        // Combine phone code and phone number for SMS
        const fullPhoneNumber =
          subscriber.phoneCode && subscriber.phone
            ? `+${subscriber.phoneCode.name}${subscriber.phone}`
            : subscriber.phone;

        // Validate we have contact information
        if (!fullPhoneNumber && !subscriber.email) {
          Logger.warn(
            `[Billing Notification] No contact information for subscriber ${subscriber.id} (${subscriber.firstName} ${subscriber.lastName})`,
          );
          continue;
        }

        // Queue notification
        await this.notificationService.queueBillingNotification({
          recipientPhone: fullPhoneNumber,
          recipientEmail: subscriber.email,
          recipientName: `${subscriber.firstName} ${subscriber.lastName}`,
          amount: parseFloat(billing.amount) || 0,
          month: billing.month,
          year: billing.year,
          propertyAddress,
          entityProfileId: entityProfile.id,
        });

        Logger.log(
          `[Billing Notification] Queued for ${subscriber.firstName} ${
            subscriber.lastName
          } - Amount: ₦${billing.amount}, Phone: ${
            fullPhoneNumber || 'N/A'
          }, Email: ${subscriber.email || 'N/A'}`,
        );
      } catch (error) {
        Logger.error(
          `[Billing Notification] Error queuing notification for subscription ${subscription.id}: ${error.message}`,
          error.stack,
        );
        // Continue with next notification even if one fails
      }
    }

    Logger.log(
      `[Billing Notification] Completed queuing for ${entityProfile.name}`,
    );
  }
}
