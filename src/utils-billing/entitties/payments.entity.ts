import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ type: 'date', default: () => 'now()' })
  paymentDate: Date;

  @Column({ type: 'varchar' })
  payerName: string;

  @Column({ type: 'varchar', nullable: true })
  comments: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  propertySubscriptionId: string;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) => propertySubscription.payments,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;
}
