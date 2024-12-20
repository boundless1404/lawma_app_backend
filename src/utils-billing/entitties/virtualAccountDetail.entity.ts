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
import { PropertySubscription } from './propertySubscription.entity';
import { EntityProfile } from './entityProfile.entity';
import VirtualAccountReceivedPayment from './virtualAccountReceivedPayment.entity';

@Entity()
export default class VirtualAccountDetail {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', default: '' })
  account_number: string;

  @Column({ type: 'varchar', default: '' })
  account_name: string;

  @Column({ type: 'varchar' })
  bank: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint', nullable: true })
  propertySubscriptionId: string;

  @Column({ type: 'bigint', nullable: true })
  entityProfileId: string;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) =>
      propertySubscription.subscriberVirtualAccountDetails,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;

  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.virtualAccountsDetails,
  )
  entityProfile: EntityProfile;

  @OneToMany(
    () => VirtualAccountReceivedPayment,
    (virtualAccountReceivedPayment) =>
      virtualAccountReceivedPayment.virtualAccountDetail,
  )
  virtualAccountReceivedPayments: VirtualAccountReceivedPayment[];
}
