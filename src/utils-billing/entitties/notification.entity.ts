import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationType } from '../../lib/types';
import { PropertySubscription } from './propertySubscription.entity';
import { EntityProfile } from './entityProfile.entity';

@Entity()
@Index(['propertySubscriptionId', 'createdAt'])
@Index(['propertySubscriptionId', 'isRead'])
@Index(['entityProfileId', 'createdAt'])
@Index(['entityProfileId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['invoice', 'payment', 'alert', 'update', 'system'],
    default: 'system',
  })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionText: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string; // 'billing', 'payment', 'subscription'

  @Column({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'bigint' })
  propertySubscriptionId: string;

  // Relations
  @ManyToOne(() => EntityProfile)
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;

  @ManyToOne(() => PropertySubscription)
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
