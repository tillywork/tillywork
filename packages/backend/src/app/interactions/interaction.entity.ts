import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { User } from '../users/user.entity';

@Entity()
export class Interaction {
  /**
   * The unique identifier for the interaction.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The type of interaction that occurred (e.g., phone call, email, meeting).
   */
  @Column({ type: 'varchar', length: 255 })
  type: string;

  /**
   * A brief description or summary of the interaction.
   */
  @Column({ type: 'text' })
  description: string;

  /**
   * The date and time when the interaction occurred.
   */
  @CreateDateColumn({ type: 'timestamp' })
  occurredOn: Date;

  /**
   * The contact with whom the interaction occurred.
   */
  @ManyToOne(() => Contact, (contact) => contact.interactionHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  contact: Contact;

  /**
   * If interactions are also user-specific, you might include a ManyToOne
   * relationship to the User entity like this:
   */
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  /**
   * Any additional notes or information about the interaction.
   */
  @Column({ type: 'text', nullable: true })
  notes?: string;

  /**
   * Outcome of the interaction if applicable, such as successful sale or follow-up required.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  outcome?: string;

  /**
   * A link to any associated documents or resources relevant to the interaction.
   */
  @Column({ type: 'varchar', length: 2048, nullable: true })
  resourceLink?: string;

  /**
   * An optional field to indicate the channel or medium of interaction, like email, phone, in-person, etc.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  channel?: string;

  /**
   * Duration of the interaction if relevant, such as the length of the phone call or meeting.
   */
  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  // Additional fields can be added here if your business has more specific requirements

  /**
   * The timestamp when the interaction was created in the system.
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
