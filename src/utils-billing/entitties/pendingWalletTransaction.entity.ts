import { Wallet_Service_Transaction_Type } from '../../lib/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class PendingWalletTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  walletReference: string;

  @Column({ type: 'varchar', nullable: true })
  sourcePaymentReference: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar' })
  creditSourceData: string;

  @Column({ type: 'enum', enum: Wallet_Service_Transaction_Type })
  type: Wallet_Service_Transaction_Type;
}
