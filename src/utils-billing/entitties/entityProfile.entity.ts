import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityProfilePreference } from './entityProfilePreference.entity';
import { EntityUserProfile } from './entityUserProfile.entity';
import { PropertySubscription } from './propertySubscription.entity';
import { Street } from './street.entity';
import { PropertyType } from './propertyTypes.entity';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import VirtualAccountDetail from './virtualAccountDetail.entity';
import EntityProfileBankAccountDetails from './entityProfileBankAcountDetails.entity';
import PaymentTransfer from './paymentTransfer.entity';
import VirtualAccountReceivedPayment from './virtualAccountReceivedPayment.entity';

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

  @OneToMany(() => Street, (street) => street.entityProfile)
  streets: Street[];

  @ManyToOne(() => PropertyType, (propertyType) => propertyType.entityProfile)
  propertyTypes: PropertyType[];

  @OneToMany(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.entityProfile,
  )
  entitySubscriberProfiles: EntitySubscriberProfile[];

  @OneToMany(
    () => VirtualAccountDetail,
    (virtualAccountDetail) => virtualAccountDetail.entityProfile,
  )
  virtualAccountsDetails: VirtualAccountDetail[];

  @OneToOne(
    () => EntityProfileBankAccountDetails,
    (entityProfileBankAccount) => entityProfileBankAccount.entityProfile,
  )
  entityProfileBankAccountDetail: EntityProfileBankAccountDetails;

  @OneToMany(
    () => PaymentTransfer,
    (paymentTransfer) => paymentTransfer.entityProfile,
  )
  paymentTransfers: PaymentTransfer[];

  @OneToMany(
    () => VirtualAccountReceivedPayment,
    (virtualAccountReceivedPayment) =>
      virtualAccountReceivedPayment.entityProfile,
  )
  virtualAccountReceivedPayments: VirtualAccountReceivedPayment[];
}
