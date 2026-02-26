import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertySubscription } from './propertySubscription.entity';

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
  propertySubscriptionId: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_duplicate: boolean;

  @Column({ type: 'numeric', nullable: true, scale: 2, precision: 10 })
  previousArrears: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // @Column({ type: 'bigint' })
  // entitySubscriptionId: string;

  // relationss
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) => propertySubscription.billings,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;
}
