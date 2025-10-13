import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RbacService, CreateRoleDto, AssignRoleDto } from './rbac.service';
import { AuthTokenPayload } from '../lib/types';
import { GetAuthPayload } from './getAuthenticatedUserPayload.decorator';
import { IsAuthenticated } from './isAuthenticated.guard';
import { PermissionGuard } from './guards/permission.guard';
import {
  RequirePermissions,
  PERMISSIONS,
} from './decorators/auth.decorators';

export class CreateCustomRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: string[];
}

export class AssignUserRoleDto {
  roleId: string;
  entityUserProfileId?: string;
  entitySubscriberProfileId?: string;
  expiryDate?: Date;
}

@Controller('rbac')
@UseGuards(IsAuthenticated)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  /**
   * Get current user profile with roles and permissions - SIMPLIFIED FOR EXISTING USERS
   */
  @Get('profile')
  async getCurrentUserProfile(@GetAuthPayload() authPayload: AuthTokenPayload) {
    if (!authPayload.userData) {
      throw new BadRequestException('User data not found in authentication token');
    }

    const profileType = authPayload.profile?.profileType || 'entity_user_profile';

    // Provide generous default permissions for existing users during RBAC transition
    const defaultRoles = [
      {
        id: 'default-role',
        name: profileType === 'entity_subscriber_profile' ? 'customer' : 'staff',
        displayName: profileType === 'entity_subscriber_profile' ? 'Customer' : 'Staff Member',
        description: 'Default role for existing users during RBAC transition',
        isSystemRole: false,
      },
    ];

    const defaultPermissions = [
      { id: '1', name: 'dashboard:view', displayName: 'View Dashboard', category: 'dashboard', action: 'view' },
      { id: '2', name: 'billing:read', displayName: 'View Bills', category: 'billing', action: 'read' },
      { id: '3', name: 'payments:read', displayName: 'View Payments', category: 'payments', action: 'read' },
      { id: '4', name: 'properties:read', displayName: 'View Properties', category: 'properties', action: 'read' },
    ];

    // Add additional permissions for entity users (non-customers)
    if (profileType !== 'entity_subscriber_profile') {
      defaultPermissions.push(
        { id: '5', name: 'billing:create', displayName: 'Create Bills', category: 'billing', action: 'create' },
        { id: '6', name: 'billing:update', displayName: 'Update Bills', category: 'billing', action: 'update' },
        { id: '7', name: 'payments:create', displayName: 'Create Payments', category: 'payments', action: 'create' },
        { id: '8', name: 'properties:create', displayName: 'Create Properties', category: 'properties', action: 'create' },
        { id: '9', name: 'properties:update', displayName: 'Update Properties', category: 'properties', action: 'update' },
        { id: '10', name: 'users:read', displayName: 'View Users', category: 'users', action: 'read' },
        { id: '11', name: 'reports:view', displayName: 'View Reports', category: 'reports', action: 'view' },
      );
    }

    return {
      user: {
        id: authPayload.userData.id,
        firstName: authPayload.userData.firstName,
        lastName: authPayload.userData.lastName,
        email: authPayload.userData.email,
        profileType: profileType,
        profileId: authPayload.profile?.profileTypeId || authPayload.userData.id,
      },
      roles: defaultRoles,
      permissions: defaultPermissions,
    };
  }

  /**
   * Initialize RBAC system for the current entity
   */
  @Post('initialize')
  @UseGuards(PermissionGuard)
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  async initializeRbac(@GetAuthPayload() authPayload: AuthTokenPayload) {
    if (!authPayload.profile) {
      throw new BadRequestException('Profile data not found in authentication token');
    }

    const entityProfileId = authPayload.profile.entityProfileId;
    if (!entityProfileId) {
      throw new BadRequestException('Entity profile ID is required but not found in token');
    }

    await this.rbacService.initializeSystemRbac(entityProfileId);
    return { message: 'RBAC system initialized successfully' };
  }

  /**
   * Get all roles for the current entity
   */
  @Get('roles')
  async getRoles(@GetAuthPayload() authPayload: AuthTokenPayload) {
    if (!authPayload.profile) {
      throw new BadRequestException('Profile data not found in authentication token');
    }

    const entityProfileId = authPayload.profile.entityProfileId;
    if (!entityProfileId) {
      throw new BadRequestException('Entity profile ID is required but not found in token');
    }

    return await this.rbacService.getRoles(entityProfileId);
  }

  /**
   * Get all permissions
   */
  @Get('permissions')
  async getPermissions() {
    return await this.rbacService.getPermissions();
  }
}
