import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntitySubscriberProperty } from './subscriberProperty.entity';

@Entity()
export class BillingAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric' })
  totalBillings: string;

  @Column({ type: 'numeric' })
  totalPayments: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  entitySubscriberPropertyId: string;

  // relations
  @ManyToOne(
    () => EntitySubscriberProperty,
    (entitySubscriberProperty) => entitySubscriberProperty.billingAccount,
  )
  @JoinColumn({ name: 'entitySubscriberPropertyId' })
  entitySubscriberProperty: EntitySubscriberProperty;
}
