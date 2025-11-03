import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PlatformRequest } from '../../lib/types';
import { UserRole } from '../../utils-billing/entitties/userRole.entity';
import { Permission } from '../../utils-billing/entitties/permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if RBAC is enabled first
    const rbacEnabled = process.env.RBAC_ENABLED === 'true';

    // If RBAC is disabled, allow all requests
    if (!rbacEnabled) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as PlatformRequest;
    const user = request.authPayload;

    if (!user) {
      return false;
    }

    return this.validateUserPermissions(user, requiredPermissions);
  }

  private async validateUserPermissions(
    user: any,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const dbManager = this.dataSource.manager;

    let userRoles: UserRole[] = [];

    // Get user roles based on profile type
    if (user.profile?.profileType === 'entity_user_profile') {
      userRoles = await dbManager.find(UserRole, {
        where: {
          entityUserProfileId: user.profile.profileTypeId,
          isActive: true,
        },
        relations: ['role', 'role.permissions'],
      });
    } else if (user.profile?.profileType === 'entity_subscriber_profile') {
      userRoles = await dbManager.find(UserRole, {
        where: {
          entitySubscriberProfileId: user.profile.profileTypeId,
          isActive: true,
        },
        relations: ['role', 'role.permissions'],
      });
    }

    // Extract all permissions from user's roles
    const userPermissions: string[] = [];
    userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((permission) => {
        userPermissions.push(permission.name);
      });
    });

    // Check if user has any of the required permissions
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
