import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';

@Entity()
export class Billing {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ type: 'varchar' })
  month: string;

  @Column({ type: 'varchar' })
  year: string;

  // foreign keys
  @Column({ type: 'bigint' })
  entitySubscriberProfileId: string;

  @Column({ type: 'bigint' })
  entitySubscriberProertyId: string;

  // relationss
  @ManyToOne(
    () => EntitySubscriberProperty,
    (entitySubscriberPropery) => entitySubscriberPropery.billings,
  )
  @JoinColumn({ name: 'entitySubscriberProertyId' })
  entitySubscriberProperty: EntitySubscriberProperty;

  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.billings,
  )
  @JoinColumn({ name: 'entitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;
}
