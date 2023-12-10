import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreatePropertyTypesDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
} from './dtos/dto';
import { ProfileTypes, SubscriberProfileRoleEnum } from '../lib/enums';
import { throwBadRequest } from '../utils/helpers';
import { EntitySubscriberProfile } from './entitties/entitySubscriberProfile.entity';
import { EntityUserProfile } from './entitties/entityUserProfile.entity';
import { AuthTokenPayload } from '../lib/types';
import { Street } from './entitties/street.entity';
import { PropertyType } from './entitties/propertyTypes.entity';
import { PropertySubscription } from './entitties/propertySubscription.entity';
import { EntitySubscriberProperty } from './entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from './entitties/billingAccount.entity';
import { Billing } from './entitties/billing.entity';
import { MonthNames } from '../lib/projectConstants';
import { bignumber } from 'mathjs';
import { LgaWard } from './entitties/lgaWard.entity';
import { Lga } from './entitties/lga.entity';

@Injectable()
export class UtilsBillingService {
  constructor(
    public dbManager: EntityManager,
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
    if (profileType === ProfileTypes.ENTITY_USER_PROFILE) {
      const entityUserProfile = this.dbManager.create(EntityUserProfile, {
        ...createUserDto,
        entityProfileId,
      });

      await this.dbManager.save(entityUserProfile);
    } else if (profileType === ProfileTypes.ENTITY_SUBSCRIBER_PROFILE) {
      const entitySubscriberProfile = this.dbManager.create(
        EntitySubscriberProfile,
        {
          ...createUserDto,
        },
      );

      await this.dbManager.save(entitySubscriberProfile);
    }
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
      // create property subscription
      // create subscriber property
      // create property subscription unit
      let subscriberProperty = transactionManager.create(
        EntitySubscriberProperty,
        {
          propertyTypeId: createSubscriptionDto.propertyTypeId,
          ownerEntitySubscriberProfileId:
            createSubscriptionDto.propertySubscriberProfileId,
        },
      );

      subscriberProperty = await transactionManager.save(subscriberProperty);

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

  async createPropertyTypes(
    createPropertyTypesDto: CreatePropertyTypesDto,
    entityProfileId: string,
  ) {
    //
    const existingPropertyType = await this.getPropertyTypeOrThrowError({
      name: createPropertyTypesDto.name,
      unitPrice: String(createPropertyTypesDto.unitPrice),
    });

    if (existingPropertyType) {
      return existingPropertyType;
    }

    const propertyType = this.dbManager.create(PropertyType, {
      unitPrice: String(createPropertyTypesDto.unitPrice),
      name: createPropertyTypesDto.name,
      entityProfileId,
    });

    await this.dbManager.save(propertyType);
  }

  async generateBilling(propertySubscriptionId: string) {
    //
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertySubscriptionId,
        },
      },
    );
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found.');
    }

    const billingAccount = await this.dbManager.findOne(BillingAccount, {
      where: {
        propertySubscriptionId,
      },
    });

    if (!billingAccount) {
      throwBadRequest('Billing account not found.');
    }

    const billing = await this.dbManager.findOne(Billing, {
      where: {
        propertySubscriptionId: propertySubscription.id,
        month: this.getMonthName(),
        year: new Date().getFullYear().toString(),
      },
    });

    if (billing) {
      throwBadRequest('Billing already generated.');
    }

    const propertySubscriptionUnits = await this.dbManager.find(
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

    const billingAmount = propertySubscriptionUnits.reduce(
      (total, propertySubscriptionUnit) => {
        return (
          total +
          propertySubscriptionUnit.propertyUnits *
            (Number(
              propertySubscriptionUnit.entitySubscriberProperty.propertyType
                .unitPrice,
            ) || 0)
        );
      },
      0,
    );
    await this.dbManager.transaction(async (transactionalEntityManager) => {
      const currentBilling = transactionalEntityManager.create(Billing, {
        propertySubscriptionId: propertySubscription.id,
        month: this.getMonthName(),
        year: new Date().getFullYear().toString(),
        amount: billingAmount.toString(),
      });
      await transactionalEntityManager.save(currentBilling);

      // update billing account
      // TODO: use bigNumber form math js
      billingAccount.totalBillings = bignumber(billingAccount.totalBillings)
        .add(currentBilling.amount)
        .toString();

      await transactionalEntityManager.save(billingAccount);
    });
  }

  async createStreet(
    createStreetDto: CreateStreetDto,
    authPayload: AuthTokenPayload,
  ) {
    let street = await this.dbManager.findOne(Street, {
      where: {
        name: createStreetDto.name,
      },
    });
    if (street) {
      throwBadRequest('Street already exists.');
    }

    // verify lgaWard and lga exist
    await this.getLgaOrThrowError({ lgaId: createStreetDto.lgaId });

    await this.getLgaWardOrThrowError({ lgaWardId: createStreetDto.lgaWardId });

    street = this.dbManager.create(Street, {
      name: createStreetDto.name,
      lgaId: createStreetDto.lgaId,
      lgaWardId: createStreetDto.lgaWardId,
      entityProfileId: authPayload.profile.entityProfileId,
    });

    await this.dbManager.save(street);
  }

  async createLgaWard(createLgaWardDto: CreateLgaWardDto) {
    await this.getLgaOrThrowError({ lgaId: createLgaWardDto.lgaId });

    // verify lga exists
    const lgaWard = this.dbManager.create(LgaWard, {
      name: createLgaWardDto.name,
      lgaId: createLgaWardDto.lgaId,
    });

    await this.dbManager.save(lgaWard);
  }

  async createLga(createLgaDto: CreateLgaDto) {
    const lga = this.dbManager.create(Lga, {
      name: createLgaDto.name,
    });

    await this.dbManager.save(lga);
  }

  //
  async getLgaWardOrThrowError({
    name,
    lgaWardId,
    throwError = true,
  }: {
    name?: string;
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
  }

  async getLgaOrThrowError({
    name,
    lgaId,
    throwError = true,
  }: {
    name?: string;
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
    name?: string;
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
    throwError = true,
  }: {
    name?: string;
    streetId?: string;
    throwError?: boolean;
  }) {
    const street = await this.dbManager.findOne(Street, {
      where: {
        ...(name ? { name } : { id: streetId }),
      },
    });

    throwError = !street && throwError;
    if (throwError) {
      throwBadRequest('Reference to street is invalid.');
    }

    return street;
  }
}
