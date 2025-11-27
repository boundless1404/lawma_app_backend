import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WasteOperator } from './waste-operator.entity';
import { PropertyData } from './property-data.entity';

@Entity('property_enumerations')
export class PropertyEnumeration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerCode: string;

  @Column()
  houseNo: string;

  @Column()
  street: string;

  @Column()
  name: string;

  @Column()
  lga: string;

  @Column()
  ward: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  outstandingBalance: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'uuid' })
  wasteOperatorId: string;

  @ManyToOne(
    () => WasteOperator,
    (wasteOperator) => wasteOperator.propertyEnumerations,
  )
  @JoinColumn({ name: 'wasteOperatorId' })
  wasteOperator: WasteOperator;

  @OneToMany(
    () => PropertyData,
    (propertyData) => propertyData.propertyEnumeration,
  )
  properties: PropertyData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
