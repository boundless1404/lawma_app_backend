import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export default class EntityProfileBankAccountDetails {
  @PrimaryColumn({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'varchar' })
  accountName: string;

  @Column({ type: 'varchar' })
  accountNumber: string;

  @Column({ type: 'varchar' })
  bankCode: string;

  @Column({ type: 'varchar' })
  bankName: string;

  @Column({ type: 'varchar', default: 'NGN' })
  currency: 'NGN' | 'USD';

  // relations
  @OneToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entityProfileBankAccountDetail,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
