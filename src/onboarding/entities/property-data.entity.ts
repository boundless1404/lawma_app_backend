import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyEnumeration } from './property-enumeration.entity';

@Entity('property_data')
export class PropertyData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyType: string;

  @Column('int')
  units: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'uuid' })
  propertyEnumerationId: string;

  @ManyToOne(
    () => PropertyEnumeration,
    (propertyEnumeration) => propertyEnumeration.properties,
  )
  @JoinColumn({ name: 'propertyEnumerationId' })
  propertyEnumeration: PropertyEnumeration;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
