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
import { Street } from './street.entity';
import { PropertyType } from './propertyTypes.entity';
import { PropertySubscriber } from './propertySubscriber.entity';
import { Billing } from './billing.entity';
import { BillingAccount } from './account.entity';

@Entity()
export class EntitySubscriberProperty {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'integer' })
  streetNumber: number;

  @Column({ type: 'bigint' })
  oldCode: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  streetId: string;

  @Column({ type: 'bigint' })
  propertyTypeId: string;

  // relations
  @ManyToOne(() => Street, (street) => street.properties)
  @JoinColumn({ name: 'streetId' })
  street: Street;

  @ManyToOne(
    () => PropertyType,
    (propertyType) => propertyType.subscriberProperties,
  )
  @JoinColumn({ name: 'propertyTypeId' })
  properyType: PropertyType;

  @OneToMany(
    () => PropertySubscriber,
    (propertySubscriber) => propertySubscriber.entitySubscriberProperty,
  )
  propertySubscribers: PropertySubscriber[];

  @OneToMany(() => Billing, (billing) => billing.entitySubscriberProperty)
  billings: Billing[];

  @ManyToOne(
    () => BillingAccount,
    (billingAccount) => billingAccount.entitySubscriberProperty,
  )
  billingAccount: BillingAccount;
}
