import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityProfilePreference } from './entityProfilePreference.entity';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { EntityUserProfile } from './entityUserProfile.entity';

@Entity()
export class EntityProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  // relations
  @OneToOne(
    () => EntityProfilePreference,
    (entityProfilePreference) => entityProfilePreference.entityProfile,
  )
  entityProfilePreference: EntityProfilePreference;

  @OneToMany(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.entityProfile,
  )
  entitySubscriberProfiles: EntitySubscriberProfile[];

  @OneToMany(
    () => EntityUserProfile,
    (entityUserProfile) => entityUserProfile.entityProfile,
  )
  entityUserProfiles: EntityUserProfile[];
}
