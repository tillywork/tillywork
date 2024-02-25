import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Interaction } from '../interactions/interaction.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Contact {
  /**
   * The unique identifier for the contact.
   * Auto-incremented integer or generated UUID are common practices.
   */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /**
   * The contact's first name. This is a mandatory field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  /**
   * The contact's last name. This is a mandatory field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true  })
  lastName: string;

  /**
   * The contact's primary email address.
   * Could be set unique if you want to enforce one contact per email.
   */
  @Column({ type: 'varchar', length: 255, nullable: true  })
  email: string;

  /**
   * The contact's primary phone number. Optional field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneNumber?: string;

  /**
   * TODO
   * The name of the company where the contact works. Optional field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  /**
   * The contact's job title. Optional field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  /**
   * The industry sector of the contact's company. Optional field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  industry?: string;

  /**
   * The department of the contact within the company. Optional field.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  department?: string;

  /**
   * Location information.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  countryRegion?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  postalCode?: string;

  /**
   * Online Presence - Links to social profiles and websites.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedInProfile?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twitterHandle?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebookProfile?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  /**
   * Engagement information.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  leadSource?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  leadStatus?: string;

  /* TODO */
  @Column({ type: 'timestamp', nullable: true })
  dateOfFirstContact?: Date;

  /* TODO */
  @Column({ type: 'timestamp', nullable: true })
  lastContacted?: Date;

  /**
   * TODO
   * Personal info like birthdays or anniversaries.
   */
  @Column({ type: 'timestamp', nullable: true })
  birthdayAnniversary?: Date;

  /**
   * TODO
   * Preferences and any other text-based information about the contact.
   */
  @Column({ type: 'text', nullable: true })
  preferences?: string;

  /**
   * CRM Management fields.
   */
  @ManyToOne(() => User, (user) => user.contacts, { nullable: true })
  @JoinColumn()
  owner?: User;

  @Column({ type: 'bigint' })
  projectId: number;

  @ManyToOne(() => Project, (project) => project.contacts)
  @JoinColumn()
  project: Project;

  /* TODO */
  @Column({ type: 'text', nullable: true })
  notes?: string;

  /**
   * System generated timestamps for record keeping.
   */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Flag to indicate if the contact has opted out of communications.
   */
  @Column({ type: 'boolean', default: false })
  doNotContact: boolean;

  /**
   * Relations to Interaction History - assuming you have an Interaction entity.
   */
  @OneToMany(() => Interaction, (interaction) => interaction.contact, {
    cascade: true,
    eager: false,
  })
  interactionHistory: Interaction[];
}
