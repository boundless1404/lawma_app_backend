import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ type: 'date', default: () => 'now()' })
  date: Date;

  @Column({ type: 'varchar' })
  payerName: string;

  @Column({ type: 'varchar', nullable: true })
  comments: string;

  // foreign keys
  @Column({ type: 'bigint' })
  propertySubscriptionId: string;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (entitySubscriberProperty) => entitySubscriberProperty.payments,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;
}
