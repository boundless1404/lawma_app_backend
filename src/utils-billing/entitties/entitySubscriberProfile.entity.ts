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
import { EntityProfile } from './entityProfile.entity';
import { PropertySubscription } from './propertySubscription.entity';
import { Billing } from './billing.entity';

@Entity()
export class EntitySubscriberProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign key
  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entitySubscriberProfiles,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;

  @OneToMany(
    () => PropertySubscription,
    (propertySubscriber) => propertySubscriber.entitySubscriberProfile,
  )
  propertySubscribers: PropertySubscription[];
}
