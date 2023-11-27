import { SubscriberProfileRoleEnum } from '../../lib/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { Street } from './street.entity';
import { PropertySubscriptionUnit } from './PropertySubscriptionUnit.entity';
import { BillingAccount } from './billingAccount.entity';
import { Billing } from './billing.entity';
import { Payment } from './payments.entity';

@Entity()
export class PropertySubscription {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'enum', enum: SubscriberProfileRoleEnum })
  subscriberPropertyRole: SubscriberProfileRoleEnum;

  @Column({ type: 'bigint', nullable: true })
  oldCode: string;

  @Column({ type: 'integer' })
  streetNumber: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  streetId: string;

  @Column({ type: 'bigint' })
  entitySubscriberProfileId: number;

  // relations
  @ManyToOne(() => Street, (street) => street.propertySubscriptions)
  @JoinColumn({ name: 'streetId' })
  street: Street;

  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.propertySubscribers,
  )
  @JoinColumn({ name: 'entitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;

  @OneToMany(
    () => PropertySubscriptionUnit,
    (unit) => unit.propertySubscription,
  )
  propertySubscriptionUnits: PropertySubscriptionUnit[];

  @OneToMany(() => Billing, (billing) => billing.propertySubscription)
  billings: Billing[];

  @OneToMany(
    () => BillingAccount,
    (billingAccount) => billingAccount.propertySubscription,
  )
  billingAccount: BillingAccount;

  @OneToMany(() => Payment, (payment) => payment.propertySubscription)
  payments: Payment[];
}
