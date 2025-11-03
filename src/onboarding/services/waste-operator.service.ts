import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityProfile } from '../../utils-billing/entitties/entityProfile.entity';
import { EntityUserProfile } from '../../utils-billing/entitties/entityUserProfile.entity';
import { CreateWasteOperatorDto } from '../dto/create-waste-operator.dto';
import { AuthService } from '../../auth/auth.service';
import { EntityProfileSignUpDto } from '../../auth/dto/dto';
import { RbacService } from '../../shared/rbac.service';

@Injectable()
export class WasteOperatorService {
  constructor(
    @InjectRepository(EntityProfile)
    private entityProfileRepository: Repository<EntityProfile>,
    @InjectRepository(EntityUserProfile)
    private entityUserProfileRepository: Repository<EntityUserProfile>,
    private authService: AuthService,
    private rbacService: RbacService,
  ) {}

  async create(
    createWasteOperatorDto: CreateWasteOperatorDto,
  ): Promise<EntityProfile> {
    // Check if company name already exists
    const existingCompany = await this.entityProfileRepository.findOne({
      where: { name: createWasteOperatorDto.companyName },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already registered');
    }

    // Check if email already exists in EntityUserProfile
    const existingUser = await this.entityUserProfileRepository.findOne({
      where: { email: createWasteOperatorDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Use the auth service to create the complete user and company setup
    const nameParts = createWasteOperatorDto.contactPersonName.split(' ');
    const entityProfileSignUpDto: EntityProfileSignUpDto = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      middleName: '',
      email: createWasteOperatorDto.email,
      phone: createWasteOperatorDto.phoneNumber,
      password: createWasteOperatorDto.password,
      entityProfile: {
        name: createWasteOperatorDto.companyName,
      },
    };

    try {
      console.log(
        'Attempting to create waste operator with data:',
        entityProfileSignUpDto,
      );
      const signupResult = await this.authService.signup(
        entityProfileSignUpDto,
      );
      console.log('Signup result:', signupResult);

      // Find and return the created EntityProfile
      const createdOperator = await this.entityProfileRepository.findOne({
        where: { name: createWasteOperatorDto.companyName },
      });

      if (!createdOperator) {
        throw new ConflictException(
          'Entity profile created but could not be retrieved',
        );
      }

      // Initialize RBAC roles for the new entity
      try {
        await this.rbacService.initializeSystemRbac(createdOperator.id);
        console.log(
          `RBAC roles initialized for entity ${createdOperator.id} (${createdOperator.name})`,
        );
      } catch (rbacError) {
        console.error('Error initializing RBAC for new entity:', rbacError);
        // Don't fail the whole operation if RBAC initialization fails
        // The entity is created, RBAC can be initialized later
      }

      return createdOperator;
    } catch (error) {
      console.error('Error creating waste operator:', error);
      console.error('Error details:', error.message, error.stack);
      throw new ConflictException('Failed to create waste operator account');
    }
  }

  async findByEmail(email: string): Promise<{
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  } | null> {
    // Check for existing user by email in EntityUserProfile
    const entityUserProfile = await this.entityUserProfileRepository.findOne({
      where: { email },
      relations: ['entityProfile'],
    });

    if (entityUserProfile && entityUserProfile.entityProfile) {
      return {
        id: entityUserProfile.entityProfile.id,
        name: entityUserProfile.entityProfile.name,
        email: entityUserProfile.email,
        phone: entityUserProfile.phone || '',
        address: '', // Address not stored in current implementation
      };
    }

    return null;
  }

  async findAll(): Promise<EntityProfile[]> {
    return this.entityProfileRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EntityProfile> {
    const wasteOperator = await this.entityProfileRepository.findOne({
      where: { id },
      relations: ['propertySubscriptions'],
    });

    if (!wasteOperator) {
      throw new BadRequestException('Waste operator not found');
    }

    return wasteOperator;
  }

  async findByName(name: string): Promise<EntityProfile> {
    const wasteOperator = await this.entityProfileRepository.findOne({
      where: { name },
    });

    if (!wasteOperator) {
      throw new BadRequestException('Waste operator not found');
    }

    return wasteOperator;
  }

  async update(
    id: string,
    updateData: { name?: string },
  ): Promise<EntityProfile> {
    const wasteOperator = await this.findOne(id);

    // Check for name conflicts if name is being updated
    if (updateData.name && updateData.name !== wasteOperator.name) {
      const existingOperator = await this.entityProfileRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingOperator) {
        throw new ConflictException('Company name already registered');
      }
    }

    Object.assign(wasteOperator, updateData);
    return this.entityProfileRepository.save(wasteOperator);
  }

  async remove(id: string): Promise<void> {
    const wasteOperator = await this.findOne(id);
    await this.entityProfileRepository.remove(wasteOperator);
  }

  async getStats(): Promise<any> {
    const totalOperators = await this.entityProfileRepository.count();

    const operatorsWithData = await this.entityProfileRepository
      .createQueryBuilder('entity')
      .leftJoin('entity.propertySubscriptions', 'subscription')
      .groupBy('entity.id')
      .having('COUNT(subscription.id) > 0')
      .getCount();

    return {
      totalOperators,
      operatorsWithData,
      operatorsWithoutData: totalOperators - operatorsWithData,
    };
  }

  // TODO: Implement mother-ship-nest integration
  // private async createMotherShipUser(wasteOperator: WasteOperator, hashedPassword: string): Promise<void> {
  //   // This would call the mother-ship-nest API to create a user account
  //   // Example implementation:
  //   /*
  //   try {
  //     const response = await this.httpService.post('/users', {
  //       email: wasteOperator.email,
  //       password: hashedPassword,
  //       name: wasteOperator.contactPersonName,
  //       // other required fields
  //     });
  //
  //     wasteOperator.motherShipUserId = response.data.id;
  //     await this.wasteOperatorRepository.save(wasteOperator);
  //   } catch (error) {
  //     // Handle error - maybe rollback waste operator creation
  //     throw new BadRequestException('Failed to create user account');
  //   }
  //   */
  // }
}
