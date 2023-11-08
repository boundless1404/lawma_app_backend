import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class EntityUserProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  // foreign key
  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entityUserProfiles,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
