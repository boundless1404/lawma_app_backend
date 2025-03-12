import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export default class PaymentTransfer {
  @PrimaryColumn({ type: 'varchar' })
  transferReference: string;

  @Column({ type: 'varchar' })
  transferCode: string;

  @Column({ type: 'numeric' })
  transferAmount: string;

  @Column({ type: 'enum', enum: ['pending', 'successful', 'failed'] })
  status: 'pending' | 'successful' | 'failed';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.paymentTransfers,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
