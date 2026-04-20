import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class EntityProfilePreference {
  @PrimaryColumn({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'boolean', default: false })
  autoGenerateBills: boolean;

  @Column({ type: 'boolean', default: true })
  enableSmsNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  enableEmailNotifications: boolean;

  // relations
  @OneToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entityProfilePreference,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
