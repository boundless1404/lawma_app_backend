# Role-Based Access Control (RBAC) Implementation

## Overview

This document outlines the comprehensive Role-Based Access Control (RBAC) system implemented for the LAWMA (Lagos Waste Management Authority) application. The RBAC system provides fine-grained access control for different user types and operations within the system.

## Architecture

### Core Components

1. **Entities**

   - `Role` - Defines roles within an entity
   - `Permission` - Defines granular permissions
   - `UserRole` - Junction table linking users to roles
   - `EntityUserProfile` - Admin/Staff users
   - `EntitySubscriberProfile` - Customer users

2. **Services**

   - `RbacService` - Core RBAC functionality
   - `AuthService` - Authentication with RBAC integration

3. **Guards**

   - `RoleGuard` - Role-based access control
   - `PermissionGuard` - Permission-based access control

4. **Decorators**
   - `@Roles()` - Specify required roles
   - `@RequirePermissions()` - Specify required permissions

## User Types and Default Roles

### Entity User Profile (Admin/Staff)

- **Super Admin** - Full system access
- **Admin** - Administrative access with most permissions
- **Billing Officer** - Billing and payment management
- **Field Officer** - Field operations and property management
- **Customer Service** - Customer support operations
- **Viewer** - Read-only access

### Entity Subscriber Profile (Customers)

- **Customer** - Basic customer access to their own data

## Permissions Structure

### Categories

- `USER_MANAGEMENT` - User creation, modification, deletion
- `BILLING` - Bill generation, modification, approval
- `PROPERTY_MANAGEMENT` - Property registration, updates
- `PAYMENTS` - Payment processing, approvals
- `REPORTS` - Report viewing and generation
- `SYSTEM_SETTINGS` - System configuration
- `NOTIFICATIONS` - Notification management

### Actions

- `CREATE` - Create new records
- `READ` - View existing records
- `UPDATE` - Modify existing records
- `DELETE` - Remove records
- `APPROVE` - Approve pending items
- `EXPORT` - Export data
- `IMPORT` - Import data

## Implementation Details

### Automatic RBAC Initialization

When a new entity (organization) is created through the signup process:

1. System permissions are created automatically
2. Default roles are created for the entity
3. The creating user is assigned the Super Admin role
4. All system roles and permissions are ready for use

### Usage Examples

#### Protecting Controllers with Roles

```typescript
@Controller('admin')
@UseGuards(RoleGuard)
@Roles(SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN)
export class AdminController {
  // Only admin and super admin can access these endpoints
}
```

#### Protecting Controllers with Permissions

```typescript
@Post('users')
@UseGuards(PermissionGuard)
@RequirePermissions(PERMISSIONS.USERS_CREATE)
async createUser(@Body() userData: CreateUserDto) {
  // Only users with USERS_CREATE permission can access
}
```

#### Protecting Individual Endpoints

```typescript
@Get('billing/:id/pdf')
@UseGuards(PermissionGuard)
@RequirePermissions(PERMISSIONS.BILLING_READ)
async downloadBillPDF(@Param('id') billId: string) {
  // Only users with BILLING_READ permission can download PDFs
}
```

### Service Usage

#### Check User Permissions

```typescript
const hasPermission = await this.rbacService.hasPermission(
  profileId,
  'entity_user_profile',
  PERMISSIONS.BILLING_CREATE,
);
```

#### Get User Roles and Permissions

```typescript
const userAccess = await this.rbacService.getUserRolesAndPermissions(
  profileId,
  'entity_user_profile',
);
```

#### Assign Role to User

```typescript
await this.rbacService.assignRole({
  roleId: 'role-id',
  entityUserProfileId: 'user-id',
  assignedByUserId: 'assigner-id',
});
```

## API Endpoints

### RBAC Management

- `POST /rbac/initialize` - Initialize RBAC for entity
- `GET /rbac/roles` - Get all roles for entity
- `POST /rbac/roles` - Create custom role
- `GET /rbac/permissions` - Get all permissions
- `POST /rbac/user-roles` - Assign role to user
- `GET /rbac/users/:profileId/roles` - Get user roles
- `DELETE /rbac/user-roles/:userRoleId` - Remove role from user

### Protected Endpoints Examples

- `POST /utils-billing/user` - Create user (requires USERS_CREATE)
- `GET /utils-billing/subscription` - View properties (requires PROPERTIES_READ)
- `POST /utils-billing/subscription` - Create property (requires PROPERTIES_CREATE)
- `GET /service-client/billing/:id/download-pdf` - Download PDF (requires BILLING_READ)

## Database Schema

### Migration

The RBAC system includes a comprehensive migration (`1704067200000-CreateRbacTables.ts`) that creates:

- Permission table with categories and actions
- Role table linked to entity profiles
- Role-permissions junction table
- User-role assignments table
- Appropriate indexes for performance

### Entity Relationships

```
EntityProfile (1) -----> (N) Role
Role (N) <------> (N) Permission (via role_permissions)
Role (1) -----> (N) UserRole
UserRole (N) -----> (1) EntityUserProfile
UserRole (N) -----> (1) EntitySubscriberProfile
```

## System Roles and Permissions Matrix

| Role             | Users | Billing      | Properties | Payments     | Reports     | Settings    | Notifications |
| ---------------- | ----- | ------------ | ---------- | ------------ | ----------- | ----------- | ------------- |
| Super Admin      | All   | All          | All        | All          | All         | All         | All           |
| Admin            | CRU   | CRUD+Approve | CRU        | Read+Approve | View+Export | Read+Update | CRU           |
| Billing Officer  | -     | CRU          | Read       | CRU          | View        | -           | Read          |
| Field Officer    | -     | Read         | CRU        | Read         | -           | -           | Read          |
| Customer Service | -     | Read         | Read       | Read         | -           | -           | CR            |
| Viewer           | -     | Read         | Read       | Read         | View        | -           | Read          |
| Customer         | -     | Read (own)   | Read (own) | Read (own)   | -           | -           | Read (own)    |

## Security Considerations

1. **Principle of Least Privilege** - Users get minimum permissions needed
2. **Role Expiry** - Roles can have expiry dates for temporary access
3. **Audit Trail** - All role assignments track who assigned them
4. **Entity Isolation** - Roles and permissions are isolated per entity
5. **System Role Protection** - System roles cannot be deleted

## Future Enhancements

1. **Dynamic Permission Creation** - Allow entities to create custom permissions
2. **Role Hierarchies** - Implement role inheritance
3. **Contextual Permissions** - Permissions based on data ownership
4. **Audit Logging** - Track all permission checks and role changes
5. **UI Integration** - Admin interface for role management
6. **Bulk Operations** - Assign/remove roles for multiple users
7. **Role Templates** - Predefined role configurations for quick setup

## Best Practices

1. Always use guards for sensitive endpoints
2. Use permission-based guards over role-based when possible
3. Regularly audit user permissions
4. Document custom permissions clearly
5. Test permission scenarios thoroughly
6. Keep roles focused and specific
7. Use descriptive permission names

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**

   - Check if user has required role/permission
   - Verify role is active and not expired
   - Ensure RBAC system was initialized for entity

2. **RBAC Not Working**

   - Verify guards are properly imported and used
   - Check if RbacService is injected in modules
   - Run RBAC initialization if needed

3. **Missing Permissions**
   - Run system permission creation
   - Check if permissions were created correctly
   - Verify permission names match constants

### Debug Commands

```typescript
// Check user permissions
const permissions = await rbacService.getUserRolesAndPermissions(
  profileId,
  profileType,
);
console.log('User permissions:', permissions);

// Check specific permission
const hasAccess = await rbacService.hasPermission(
  profileId,
  profileType,
  permissionName,
);
console.log('Has permission:', hasAccess);

// List all roles for entity
const roles = await rbacService.getRoles(entityProfileId);
console.log('Available roles:', roles);
```

This RBAC implementation provides a robust, scalable foundation for access control in the LAWMA application, supporting both current needs and future expansion.
