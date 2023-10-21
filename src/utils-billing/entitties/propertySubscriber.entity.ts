import { SubscriberPropertyRoleEnum } from '../../lib/enums';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';

@Entity()
export class PropertySubscriber {
  @PrimaryColumn({ type: 'bigint' })
  entitySubscriberProfileId: string;

  @PrimaryColumn({ type: 'bigint' })
  entitySubscriberPropertyId: boolean;

  @PrimaryColumn({ type: 'bigint' })
  subscriberPropertyRole: SubscriberPropertyRoleEnum;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // relations
  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.propertySubscribers,
  )
  @JoinColumn({ name: 'entitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;

  @ManyToOne(
    () => EntitySubscriberProperty,
    (subscriberProperty) => subscriberProperty.propertySubscribers,
  )
  @JoinColumn({ name: 'entitySubscriberPropertyId' })
  entitySubscriberProperty: EntitySubscriberProperty;
}
