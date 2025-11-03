import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PropertyEnumeration } from './property-enumeration.entity';

@Entity('waste_operators')
export class WasteOperator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  companyName: string;

  @Column()
  contactPersonName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  areaOfOperation: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  motherShipUserId: string; // Link to mother-ship-nest user ID

  @OneToMany(() => PropertyEnumeration, (property) => property.wasteOperator)
  propertyEnumerations: PropertyEnumeration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
