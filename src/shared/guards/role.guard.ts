import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PlatformRequest } from '../../lib/types';
import { UserRole } from '../../utils-billing/entitties/userRole.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as PlatformRequest;
    const user = request.authPayload;

    if (!user) {
      return false;
    }

    return this.validateUserRoles(user, requiredRoles);
  }

  private async validateUserRoles(
    user: any,
    requiredRoles: string[],
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
        relations: ['role'],
      });
    } else if (user.profile?.profileType === 'entity_subscriber_profile') {
      userRoles = await dbManager.find(UserRole, {
        where: {
          entitySubscriberProfileId: user.profile.profileTypeId,
          isActive: true,
        },
        relations: ['role'],
      });
    }

    const userRoleNames = userRoles.map((userRole) => userRole.role.name);

    // Check if user has any of the required roles
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
