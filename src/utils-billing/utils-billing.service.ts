import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateSubscriptionDto, CreateUserDto } from './dtos/dto';
import { ProfileTypes, SubscriberProfileRoleEnum } from '../lib/enums';
import { throwBadRequest } from '../utils/helpers';
import { EntitySubscriberProfile } from './entitties/entitySubscriberProfile.entity';
import { EntityUserProfile } from './entitties/entityUserProfile.entity';
import { AuthTokenPayload } from '../lib/types';
import { Street } from './entitties/street.entity';
import { PropertyType } from './entitties/propertyTypes.entity';
import { PropertySubscription } from './entitties/propertySubscription.entity';
import { EntitySubscriberProperty } from './entitties/entitySubscriberProperty.entity';
import { async } from 'rxjs';
import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from './entitties/billingAccount.entity';

@Injectable()
export class UtilsBillingService {
  constructor(
    private dbManager: EntityManager,
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
    await this.validateStreetById(createSubscriptionDto.streetId);

    // verify propertyTypeId
    await this.validatePropertyTypeById(createSubscriptionDto.propertyTypeId);

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

  //
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

  async validatePropertyTypeById(propertyTypeId: string) {
    const propertyType = await this.dbManager.findOne(PropertyType, {
      where: {
        id: propertyTypeId,
      },
    });

    if (!propertyType) {
      throwBadRequest('Reference to property type is invalid.');
    }

    return !!propertyType;
  }

  async validateStreetById(streetId: string) {
    const street = await this.dbManager.findOne(Street, {
      where: {
        id: streetId,
      },
    });

    if (!street) {
      throwBadRequest('Reference to street is invalid.');
    }

    return !!street;
  }
}
