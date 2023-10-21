import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ type: 'date', default: () => 'now()' })
  date: Date;

  @Column({ type: 'varchar' })
  payer: string;

  @Column({ type: 'varchar', nullable: true })
  comments: string;
}
