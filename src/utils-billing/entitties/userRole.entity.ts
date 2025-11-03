import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { EntityUserProfile } from './entityUserProfile.entity';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate: Date; // For temporary role assignments

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign keys
  @Column({ type: 'bigint' })
  roleId: string;

  @Column({ type: 'bigint', nullable: true })
  entityUserProfileId: string;

  @Column({ type: 'bigint', nullable: true })
  entitySubscriberProfileId: string;

  @Column({ type: 'bigint' })
  assignedByUserId: string; // Who assigned this role

  // Relations
  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(
    () => EntityUserProfile,
    (entityUserProfile) => entityUserProfile.userRoles,
    { nullable: true },
  )
  @JoinColumn({ name: 'entityUserProfileId' })
  entityUserProfile: EntityUserProfile;

  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.userRoles,
    { nullable: true },
  )
  @JoinColumn({ name: 'entitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;
}
