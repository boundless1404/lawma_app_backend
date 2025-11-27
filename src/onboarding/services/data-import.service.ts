import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, ILike } from 'typeorm';
import { EntityProfile } from '../../utils-billing/entitties/entityProfile.entity';
import { BulkImportDto, PropertyRecordDto } from '../dto/bulk-import.dto';
import { EntitySubscriberProfile } from '../../utils-billing/entitties/entitySubscriberProfile.entity';
import { PropertySubscription } from '../../utils-billing/entitties/propertySubscription.entity';
import { Street } from '../../utils-billing/entitties/street.entity';
import { Lga } from '../../utils-billing/entitties/lga.entity';
import { LgaWard } from '../../utils-billing/entitties/lgaWard.entity';
import { PropertyType } from '../../utils-billing/entitties/propertyTypes.entity';
import { EntitySubscriberProperty } from '../../utils-billing/entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from '../../utils-billing/entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from '../../utils-billing/entitties/billingAccount.entity';
import { RequestService } from '../../shared/request/request.service';
import { SubscriberProfileRoleEnum } from '../../lib/enums';

export interface FailedRecord {
  customerCode: string;
  name: string;
  houseNo: string;
  street: string;
  lga: string;
  ward: string;
  errorReason: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: string[];
  duplicates: number;
  failedRecordDetails: FailedRecord[];
}

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(
    @InjectRepository(EntityProfile)
    private entityProfileRepository: Repository<EntityProfile>,
    @InjectRepository(EntitySubscriberProfile)
    private entitySubscriberProfileRepository: Repository<EntitySubscriberProfile>,
    @InjectRepository(PropertySubscription)
    private propertySubscriptionRepository: Repository<PropertySubscription>,
    @InjectRepository(Street)
    private streetRepository: Repository<Street>,
    @InjectRepository(Lga)
    private lgaRepository: Repository<Lga>,
    @InjectRepository(LgaWard)
    private lgaWardRepository: Repository<LgaWard>,
    @InjectRepository(PropertyType)
    private propertyTypeRepository: Repository<PropertyType>,
    @InjectRepository(EntitySubscriberProperty)
    private entitySubscriberPropertyRepository: Repository<EntitySubscriberProperty>,
    @InjectRepository(PropertySubscriptionUnit)
    private propertySubscriptionUnitRepository: Repository<PropertySubscriptionUnit>,
    @InjectRepository(BillingAccount)
    private billingAccountRepository: Repository<BillingAccount>,
    private dataSource: DataSource,
    private requestService: RequestService,
  ) {}

  async importBulkData(bulkImportDto: BulkImportDto): Promise<ImportResult> {
    const {
      records,
      wasteOperatorId,
      createdByEntityUserProfileId,
      startRange,
      endRange,
    } = bulkImportDto;

    this.logger.log(
      `Starting bulk import for waste operator: ${wasteOperatorId}, total records: ${records.length}`,
    );

    // Apply range filtering if specified
    let recordsToProcess = records;
    if (startRange !== undefined) {
      // Convert to 0-based index (startRange is 1-based from user perspective)
      const startIndex = Math.max(0, startRange - 1);
      const endIndex = endRange !== undefined ? endRange : records.length;

      recordsToProcess = records.slice(startIndex, endIndex);

      this.logger.log(
        `Range filter applied: Processing records ${startRange} to ${
          endRange || 'end'
        } (${recordsToProcess.length} records)`,
      );
    }

    // Verify waste operator (EntityProfile) exists
    const wasteOperator = await this.entityProfileRepository.findOne({
      where: { id: wasteOperatorId },
    });

    if (!wasteOperator) {
      this.logger.error(`Waste operator not found: ${wasteOperatorId}`);
      throw new BadRequestException('Waste operator not found');
    }

    this.logger.log(`Found waste operator: ${wasteOperator.name}`);

    const result: ImportResult = {
      success: false,
      totalRecords: recordsToProcess.length,
      importedRecords: 0,
      failedRecords: 0,
      errors: [],
      duplicates: 0,
      failedRecordDetails: [],
    };

    // Process records in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < recordsToProcess.length; i += batchSize) {
      const batch = recordsToProcess.slice(i, i + batchSize);
      this.logger.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}, size: ${
          batch.length
        }`,
      );

      const results = await Promise.allSettled(
        batch.map(async (record) => {
          try {
            await this.processRecord(
              record,
              wasteOperator,
              createdByEntityUserProfileId,
            );
            result.importedRecords++;
          } catch (error) {
            result.failedRecords++;
            const errorMsg = `Record ${record.customerCode}: ${error.message}`;
            result.errors.push(errorMsg);

            // Add detailed failed record info
            result.failedRecordDetails.push({
              customerCode: record.customerCode,
              name: record.name,
              houseNo: record.houseNo,
              street: record.street,
              lga: record.lga,
              ward: record.ward,
              errorReason: error.message || 'Unknown error',
            });

            this.logger.error(errorMsg, error.stack);
            throw error;
          }
        }),
      );

      // Log batch results
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      this.logger.log(
        `Batch complete: ${succeeded} succeeded, ${failed} failed`,
      );
    }

    result.success = true;
    this.logger.log(
      `Import complete: ${result.importedRecords} imported, ${result.failedRecords} failed`,
    );
    return result;
  }

  private async processRecord(
    record: PropertyRecordDto,
    wasteOperator: EntityProfile,
    createdByEntityUserProfileId?: string,
  ): Promise<void> {
    // Validate required fields
    if (!record.customerCode || !record.name || !record.street) {
      throw new Error('Missing required fields: customerCode, name, or street');
    }

    this.logger.log(
      `Processing record: ${record.customerCode} - ${record.name}`,
    );

    // Check if customer already exists by customer code
    // Check for existing subscriber by customer code (exact match - property level)
    const existingByCode = await this.propertySubscriptionRepository.findOne({
      where: {
        oldCode: record.customerCode,
      },
    });

    if (existingByCode) {
      throw new Error('Property already exists (duplicate customer code)');
    }

    // Use transaction to ensure data consistency
    try {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        // 1. Find or create street (with LGA and Ward) - need this first for grouping
        const street = await this.findOrCreateStreet(
          record.street,
          wasteOperator,
          manager,
        );

        // 2. Find or create EntitySubscriberProfile (grouped by name + street)
        const subscriberProfile = await this.findOrCreateSubscriberProfile(
          record,
          street,
          wasteOperator,
          createdByEntityUserProfileId,
          manager,
        );
        this.logger.log(
          `Subscriber profile ID: ${subscriberProfile.profile.id} ${
            subscriberProfile.existingProfile ? '(existing)' : '(new)'
          }`,
        );

        // 3. Create user on auth server only for new profiles
        if (!subscriberProfile.existingProfile) {
          await this.createUserOnAuthServer(record, subscriberProfile.profile);
        }

        // 4. Create PropertySubscription
        const propertySubscription = await this.createPropertySubscription(
          record,
          subscriberProfile.profile,
          street,
          wasteOperator,
          manager,
        );

        // 5. Create PropertySubscriptionUnits for each property type
        if (record.properties && record.properties.length > 0) {
          this.logger.log(
            `Step 5: Creating ${record.properties.length} property units`,
          );
          await this.createPropertyUnits(
            record,
            propertySubscription,
            subscriberProfile.profile,
            wasteOperator,
            manager,
          );
        }

        // 6. Create BillingAccount with outstanding balance
        await this.createBillingAccount(record, propertySubscription, manager);
      });
    } catch (error) {
      this.logger.error(
        `Transaction failed for ${record.customerCode}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async createUserOnAuthServer(
    record: PropertyRecordDto,
    subscriberProfile: EntitySubscriberProfile,
  ): Promise<any> {
    try {
      // Use the subscriber profile email for consistency
      const email = subscriberProfile.email;

      // Generate a default password (customer can reset later)
      const password = this.generateDefaultPassword(email);

      // Use names from subscriber profile
      const { firstName, lastName, middleName } = subscriberProfile;

      // Extract phone code if phone number is provided
      let phone = record.phoneNumber || '';
      let phoneCode = '';

      if (phone && phone.startsWith('+')) {
        const match = phone.match(/^\+(\d{1,4})/);
        if (match) {
          phoneCode = match[1];
          phone = phone.substring(match[0].length);
        }
      }

      const requestBody = {
        firstName,
        lastName,
        middleName: middleName || '',
        email,
        phone: phone || email, // Use email as phone if not provided
        phoneCode: phoneCode || '234', // Default to Nigeria
        password,
        initiateVerificationRequest: false,
      };

      const response = await this.requestService.requestApiService(
        '/project/app/signup',
        {
          body: requestBody,
          method: 'POST',
        },
      );

      if ([200, 201].includes(response.status)) {
        return response.data;
      } else {
        this.logger.warn(`Failed to create user: ${response.status}`);
        return null;
      }
    } catch (error) {
      // If user already exists on auth server, that's okay
      if (
        error.message?.includes('already exists') ||
        error.response?.status === 409
      ) {
        this.logger.warn(
          `User already exists on auth server: ${record.customerCode}`,
        );
        return null;
      }
      // Don't throw - log and continue
      this.logger.error(`Error creating auth user: ${error.message}`);
      return null;
    }
  }

  /**
   * Find or create subscriber profile based on name + street combination
   * This ensures that the same person managing multiple properties on the same street
   * gets grouped under one subscriber profile
   *
   * IMPORTANT: Generic names like "OCCUPANT", "OWNER" are NOT grouped - each gets unique profile
   */
  private async findOrCreateSubscriberProfile(
    record: PropertyRecordDto,
    street: Street,
    wasteOperator: EntityProfile,
    createdByEntityUserProfileId: string | undefined,
    manager: EntityManager,
  ): Promise<{ profile: EntitySubscriberProfile; existingProfile: boolean }> {
    const { firstName, lastName, middleName } = this.parseCustomerName(
      record.name,
    );

    // Check if this is a generic placeholder name that should NOT be grouped
    const isGenericName = this.isGenericPlaceholderName(record.name);

    let groupingKey: string;

    if (isGenericName) {
      // For generic names, use customer code to ensure uniqueness
      // Each "OCCUPANT" or "OWNER" gets their own profile
      groupingKey = this.generateEmail(record.customerCode, record.name);
      this.logger.log(
        `Generic name detected (${record.name}) - creating unique profile`,
      );
    } else {
      // For real names, group by name + street (same person, same street = same profile)
      groupingKey = this.generateGroupingEmail(record.name, street.name);
      this.logger.log(
        `Real name detected (${record.name}) - grouping by name + street`,
      );
    }

    // Try to find existing subscriber with this grouping key
    let subscriberProfile = await manager.findOne(EntitySubscriberProfile, {
      where: { email: groupingKey },
    });

    if (subscriberProfile) {
      this.logger.log(
        `Found existing subscriber profile for ${record.name} (${groupingKey})`,
      );
      return { profile: subscriberProfile, existingProfile: true };
    }

    // Create new subscriber profile
    subscriberProfile = manager.create(EntitySubscriberProfile, {
      firstName,
      lastName,
      middleName: middleName || null,
      email: groupingKey,
      phone: record.phoneNumber || null,
      phoneCodeId: null,
      createdByEntityUserProfileId: createdByEntityUserProfileId || null,
      createdByEntityProfileId: wasteOperator.id,
    });

    subscriberProfile = await manager.save(
      EntitySubscriberProfile,
      subscriberProfile,
    );

    return { profile: subscriberProfile, existingProfile: false };
  }

  private async createSubscriberProfile(
    record: PropertyRecordDto,
    manager: EntityManager,
  ): Promise<EntitySubscriberProfile> {
    const { firstName, lastName, middleName } = this.parseCustomerName(
      record.name,
    );

    const email = this.generateEmail(record.customerCode, record.name);

    // Don't set phoneCodeId if we don't have a phone number
    const subscriberProfile = manager.create(EntitySubscriberProfile, {
      firstName,
      lastName,
      middleName: middleName || null,
      email,
      phone: record.phoneNumber || null,
      phoneCodeId: null, // Don't set phoneCodeId - it can be null
    });

    return await manager.save(EntitySubscriberProfile, subscriberProfile);
  }

  private async findOrCreateStreet(
    streetName: string,
    wasteOperator: EntityProfile,
    manager: EntityManager,
  ): Promise<Street> {
    // Normalize street name: trim whitespace and convert to uppercase
    const normalizedStreetName = streetName.trim().toUpperCase();

    // Try to find existing street for this waste operator using case-insensitive search
    // Use ILike for case-insensitive matching
    let street = await manager.findOne(Street, {
      where: {
        name: ILike(normalizedStreetName),
        entityProfileId: wasteOperator.id,
      },
    });

    if (street) {
      return street;
    }

    // Create default LGA and Ward if they don't exist
    const defaultLga = await this.findOrCreateDefaultLga(manager);
    const defaultWard = await this.findOrCreateDefaultWard(defaultLga, manager);

    // Create new street with normalized name
    street = manager.create(Street, {
      name: normalizedStreetName, // Store in uppercase
      lgaWardId: defaultWard.id,
      entityProfileId: wasteOperator.id,
    });

    const savedStreet = await manager.save(Street, street);
    this.logger.log(
      `Created new street: ${normalizedStreetName} (ID: ${savedStreet.id})`,
    );

    return savedStreet;
  }

  private async findOrCreateDefaultLga(manager: EntityManager): Promise<Lga> {
    let lga = await manager.findOne(Lga, {
      where: { name: 'Default LGA' },
    });

    if (!lga) {
      lga = manager.create(Lga, {
        name: 'Default LGA',
        abbreviation: 'DFL',
      });
      lga = await manager.save(Lga, lga);
    }

    return lga;
  }

  private async findOrCreateDefaultWard(
    lga: Lga,
    manager: EntityManager,
  ): Promise<LgaWard> {
    let ward = await manager.findOne(LgaWard, {
      where: { name: 'Default Ward', lgaId: lga.id },
    });

    if (!ward) {
      ward = manager.create(LgaWard, {
        name: 'Default Ward',
        lgaId: lga.id,
      });
      ward = await manager.save(LgaWard, ward);
    }

    return ward;
  }

  private async createPropertySubscription(
    record: PropertyRecordDto,
    subscriberProfile: EntitySubscriberProfile,
    street: Street,
    wasteOperator: EntityProfile,
    manager: EntityManager,
  ): Promise<PropertySubscription> {
    const propertySubscription = manager.create(PropertySubscription, {
      propertySubscriptionName: `${record.name} - ${record.houseNo} ${record.street}`,
      subscriberProfileRole: SubscriberProfileRoleEnum.OWNER,
      oldCode: record.customerCode,
      streetNumber: record.houseNo,
      streetId: street.id,
      entitySubscriberProfileId: subscriberProfile.id,
      entityProfileId: wasteOperator.id,
    });

    return await manager.save(PropertySubscription, propertySubscription);
  }

  private async createPropertyUnits(
    record: PropertyRecordDto,
    propertySubscription: PropertySubscription,
    subscriberProfile: EntitySubscriberProfile,
    wasteOperator: EntityProfile,
    manager: EntityManager,
  ): Promise<void> {
    for (const property of record.properties) {
      if (!property.propertyType || property.units <= 0) {
        continue;
      }

      // Find or create property type
      const propertyType = await this.findOrCreatePropertyType(
        property.propertyType,
        property.rate,
        wasteOperator,
        manager,
      );

      // Create EntitySubscriberProperty
      const entitySubscriberProperty = manager.create(
        EntitySubscriberProperty,
        {
          propertyTypeId: propertyType.id,
          ownerEntitySubscriberProfileId: subscriberProfile.id,
        },
      );
      const savedEntitySubscriberProperty = await manager.save(
        EntitySubscriberProperty,
        entitySubscriberProperty,
      );

      // Create PropertySubscriptionUnit
      const propertySubscriptionUnit = manager.create(
        PropertySubscriptionUnit,
        {
          propertySubscriptionId: propertySubscription.id,
          entiySubscriberPropertyId: savedEntitySubscriberProperty.id,
          propertyUnits: property.units,
        },
      );

      await manager.save(PropertySubscriptionUnit, propertySubscriptionUnit);
    }
  }

  private async findOrCreatePropertyType(
    propertyTypeName: string,
    rate: number,
    wasteOperator: EntityProfile,
    manager: EntityManager,
  ): Promise<PropertyType> {
    // Normalize property type name and create unique identifier with rate
    const normalizedBaseName = propertyTypeName.trim().toUpperCase();
    const formattedRate = rate.toFixed(2); // Ensure consistent formatting

    // Create unique name: PropertyType-Rate (e.g., "FLAT-2500.00")
    const uniquePropertyTypeName = `${normalizedBaseName}-${formattedRate}`;

    // Try to find existing property type with same name AND rate
    let propertyType = await manager.findOne(PropertyType, {
      where: {
        name: uniquePropertyTypeName,
        unitPrice: formattedRate,
        entityProfileId: wasteOperator.id,
      },
    });

    if (!propertyType) {
      this.logger.log(
        `Creating new property type: ${uniquePropertyTypeName} with rate ${formattedRate}`,
      );

      propertyType = manager.create(PropertyType, {
        name: uniquePropertyTypeName,
        unitPrice: formattedRate,
        entityProfileId: wasteOperator.id,
      });
      propertyType = await manager.save(PropertyType, propertyType);
    } else {
      this.logger.log(
        `Using existing property type: ${uniquePropertyTypeName}`,
      );
    }

    return propertyType;
  }

  private async createBillingAccount(
    record: PropertyRecordDto,
    propertySubscription: PropertySubscription,
    manager: EntityManager,
  ): Promise<BillingAccount> {
    const billingAccount = manager.create(BillingAccount, {
      propertySubscriptionId: propertySubscription.id,
      totalBillings: record.outstandingBalance.toString(),
      totalPayments: '0',
    });

    return await manager.save(BillingAccount, billingAccount);
  }

  // Helper methods
  private generateEmail(customerCode: string, name: string): string {
    // Create email from customer code and name
    const cleanCode = customerCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const cleanName = name
      .split(' ')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    return `${cleanName}.${cleanCode}@lawma.imported.customer`;
  }

  /**
   * Generate email for grouping subscribers by name + street
   * This ensures that the same person on the same street gets one profile
   */
  private generateGroupingEmail(name: string, streetName: string): string {
    // Clean and normalize the name
    const cleanName = name
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '.')
      .toLowerCase();

    // Clean and normalize the street name
    const cleanStreet = streetName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '.')
      .toLowerCase();

    return `${cleanName}.${cleanStreet}@lawma.grouped.customer`;
  }

  private generateDefaultPassword(identifier: string): string {
    // Generate a simple password from identifier
    return `Lawma${identifier.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}!`;
  }

  /**
   * Check if a name is a generic placeholder that should not be grouped
   * Generic names like "OCCUPANT", "OWNER", "OCCUPAN" should each get unique profiles
   * Real names like "MR ADEBAYO", "MRS FUNMI" should be grouped
   */
  private isGenericPlaceholderName(name: string): boolean {
    const normalizedName = name.trim().toUpperCase();

    // List of generic placeholder names/patterns
    const genericPatterns = [
      /^OCCUPANT$/i,
      /^OCCUPAN$/i,
      /^OWNER$/i,
      /^OWNER\/$/i,
      /^OWNER\s*$/i,
      /^TENANT$/i,
      /^LANDLORD$/i,
      /^CUSTOMER$/i,
      /^CLIENT$/i,
      /^RESIDENT$/i,
      /^UNKNOWN$/i,
      /^N\/A$/i,
      /^VACANT$/i,
      /^EMPTY$/i,
    ];

    // Check if name matches any generic pattern
    return genericPatterns.some((pattern) => pattern.test(normalizedName));
  }

  private parseCustomerName(fullName: string): {
    firstName: string;
    lastName: string;
    middleName?: string;
  } {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);

    if (parts.length === 0) {
      return { firstName: 'Customer', lastName: 'Unknown' };
    } else if (parts.length === 1) {
      return { firstName: parts[0], lastName: parts[0] };
    } else if (parts.length === 2) {
      return { firstName: parts[0], lastName: parts[1] };
    } else {
      return {
        firstName: parts[0],
        middleName: parts.slice(1, -1).join(' '),
        lastName: parts[parts.length - 1],
      };
    }
  }

  async getImportSummary(wasteOperatorId: string): Promise<any> {
    const wasteOperator = await this.entityProfileRepository.findOne({
      where: { id: wasteOperatorId },
      relations: ['propertySubscriptions'],
    });

    if (!wasteOperator) {
      throw new BadRequestException('Waste operator not found');
    }

    // Get all property subscriptions for this waste operator
    const propertySubscriptions =
      await this.propertySubscriptionRepository.find({
        where: { entityProfileId: wasteOperatorId },
        relations: [
          'entitySubscriberProfile',
          'propertySubscriptionUnits',
          'propertySubscriptionUnits.entitySubscriberProperty',
          'propertySubscriptionUnits.entitySubscriberProperty.propertyType',
          'billingAccount',
          'street',
          'street.lgaWard',
          'street.lgaWard.lga',
        ],
      });

    // Calculate summary statistics
    const totalProperties = propertySubscriptions.length;
    let totalAmount = 0;
    let totalOutstanding = 0;
    const lgaSummary: Record<string, number> = {};
    const propertyTypeSummary: Record<string, number> = {};

    for (const subscription of propertySubscriptions) {
      // Calculate total from billing account
      if (subscription.billingAccount) {
        const billings = parseFloat(
          subscription.billingAccount.totalBillings || '0',
        );
        const payments = parseFloat(
          subscription.billingAccount.totalPayments || '0',
        );
        totalAmount += billings;
        totalOutstanding += billings - payments;
      }

      // LGA summary
      const lgaName = subscription.street?.lgaWard?.lga?.name || 'Unknown';
      lgaSummary[lgaName] = (lgaSummary[lgaName] || 0) + 1;

      // Property type summary
      for (const unit of subscription.propertySubscriptionUnits || []) {
        const propertyTypeName =
          unit.entitySubscriberProperty?.propertyType?.name || 'Unknown';
        propertyTypeSummary[propertyTypeName] =
          (propertyTypeSummary[propertyTypeName] || 0) + unit.propertyUnits;
      }
    }

    return {
      wasteOperator: {
        id: wasteOperator.id,
        companyName: wasteOperator.name,
        contactPersonName: 'N/A',
        email: 'N/A',
      },
      summary: {
        totalProperties,
        totalPropertyData: propertySubscriptions.reduce(
          (sum, ps) => sum + (ps.propertySubscriptionUnits?.length || 0),
          0,
        ),
        totalAmount,
        totalOutstanding,
      },
      lgaSummary,
      propertyTypeSummary,
    };
  }

  async deleteImportedData(wasteOperatorId: string): Promise<void> {
    const wasteOperator = await this.entityProfileRepository.findOne({
      where: { id: wasteOperatorId },
    });

    if (!wasteOperator) {
      throw new BadRequestException('Waste operator not found');
    }

    // Use transaction to ensure all deletions happen together
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Get all property subscriptions for this waste operator
      const propertySubscriptions = await manager.find(PropertySubscription, {
        where: { entityProfileId: wasteOperatorId },
        relations: [
          'propertySubscriptionUnits',
          'billingAccount',
          'entitySubscriberProfile',
        ],
      });

      for (const subscription of propertySubscriptions) {
        // Delete property subscription units
        if (subscription.propertySubscriptionUnits?.length > 0) {
          await manager.delete(PropertySubscriptionUnit, {
            propertySubscriptionId: subscription.id,
          });
        }

        // Delete billing account
        if (subscription.billingAccount) {
          await manager.delete(BillingAccount, {
            propertySubscriptionId: subscription.id,
          });
        }

        // Delete the property subscription itself
        await manager.delete(PropertySubscription, { id: subscription.id });

        // Delete the entity subscriber profile if it's only used by this subscription
        if (subscription.entitySubscriberProfile) {
          const otherSubscriptions = await manager.count(PropertySubscription, {
            where: {
              entitySubscriberProfileId:
                subscription.entitySubscriberProfile.id,
            },
          });

          if (otherSubscriptions === 0) {
            await manager.delete(EntitySubscriberProfile, {
              id: subscription.entitySubscriberProfile.id,
            });
          }
        }
      }
    });
  }

  /**
   * Generate CSV content from failed records
   */
  generateFailedRecordsCSV(failedRecords: FailedRecord[]): string {
    if (!failedRecords || failedRecords.length === 0) {
      return '';
    }

    // CSV Header
    const headers = [
      'Customer Code',
      'Name',
      'House No',
      'Street',
      'LGA',
      'Ward',
      'Error Reason',
    ];

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string): string => {
      if (!value) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV rows
    const rows = failedRecords.map((record) =>
      [
        escapeCSV(record.customerCode),
        escapeCSV(record.name),
        escapeCSV(record.houseNo),
        escapeCSV(record.street),
        escapeCSV(record.lga),
        escapeCSV(record.ward),
        escapeCSV(record.errorReason),
      ].join(','),
    );

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  }
}
