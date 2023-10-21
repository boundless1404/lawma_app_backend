import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntitySubscriberProperty } from './subscriberProperty.entity';

@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric' })
  unitPrice: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // relations
  @OneToMany(() => EntitySubscriberProperty, (property) => property.properyType)
  subscriberProperties: EntitySubscriberProperty[];
}
