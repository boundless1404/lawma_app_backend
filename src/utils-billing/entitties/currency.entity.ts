import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from './country.entity';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  fullname: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  countryId: number;

  // relations
  @ManyToOne(() => Country, (country) => country.currencies)
  @JoinColumn({ name: 'countryId' })
  country: Country;
}
