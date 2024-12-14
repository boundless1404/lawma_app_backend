import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityProfile } from './entityProfile.entity';
import VirtualAccountDetail from './virtualAccountDetail.entity';

@Entity()
export default class VirtualAccountReceivedPayment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  paymentReference: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'bigint' })
  virtualAccountDetailId: string;

  // relations
  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.virtualAccountReceivedPayments,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;

  @ManyToOne(
    () => VirtualAccountDetail,
    (virtualAccountDetail) =>
      virtualAccountDetail.virtualAccountReceivedPayments,
    { onDelete: 'CASCADE' },
  )
  virtualAccountDetail: VirtualAccountDetail;
}
