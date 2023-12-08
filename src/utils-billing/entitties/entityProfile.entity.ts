import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityProfilePreference } from './entityProfilePreference.entity';
import { EntityUserProfile } from './entityUserProfile.entity';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export class EntityProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  // TODO: add lga / ward id

  // relations
  @OneToOne(
    () => EntityProfilePreference,
    (entityProfilePreference) => entityProfilePreference.entityProfile,
  )
  entityProfilePreference: EntityProfilePreference;

  // @OneToMany(
  //   () => EntitySubscriberProfile,
  //   (entitySubscriberProfile) => entitySubscriberProfile.entityProfile,
  // )
  // entitySubscriberProfiles: EntitySubscriberProfile[];

  @OneToMany(
    () => EntityUserProfile,
    (entityUserProfile) => entityUserProfile.entityProfile,
  )
  entityUserProfiles: EntityUserProfile[];

  @OneToMany(
    () => PropertySubscription,
    (propertySubscription) => propertySubscription.entityProfile,
  )
  propertySubscriptions: PropertySubscription[];
}
