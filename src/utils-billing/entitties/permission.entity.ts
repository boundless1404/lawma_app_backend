import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionCategory {
  USER_MANAGEMENT = 'user_management',
  BILLING = 'billing',
  PROPERTY_MANAGEMENT = 'property_management',
  PAYMENTS = 'payments',
  REPORTS = 'reports',
  SYSTEM_SETTINGS = 'system_settings',
  NOTIFICATIONS = 'notifications',
  DASHBOARD = 'dashboard',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
}

@Entity()
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string; // e.g., 'billing:create', 'users:read'

  @Column({ type: 'varchar' })
  displayName: string; // e.g., 'Create Bills', 'View Users'

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PermissionCategory })
  category: PermissionCategory;

  @Column({ type: 'enum', enum: PermissionAction })
  action: PermissionAction;

  @Column({ type: 'varchar', nullable: true })
  resource: string; // Optional: specific resource like 'property', 'user'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
