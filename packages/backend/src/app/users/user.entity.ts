import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { Interaction } from '../interactions//interaction.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class User {
  /**
   * The unique identifier for the user.
   */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /**
   * The username for the user. It is unique across the system.
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  /**
   * The hashed password for the user. It is stored in a secure way using bcrypt.
   */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /**
   * The user's email address. It can also be set to unique if you desire.
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * The first name of the user.
   */
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  /**
   * The last name of the user.
   */
  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  /**
   * The roles assigned to the user. It can represent different permission levels.
   */
  @Column({ type: 'simple-array', default: ['user'] })
  roles: string[];

  /**
   * A timestamp representing when the user account was created.
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /**
   * A timestamp representing when the user account was last updated.
   */
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  /**
   * A relationship to the Contact entity representing contacts owned by the user.
   */
  @OneToMany(() => Contact, (contact) => contact.owner)
  contacts: Contact[];

  /**
   * A relationship to the Interaction entity representing interactions owned by the user.
   */
  @OneToMany(() => Interaction, (interaction) => interaction.user)
  interactions: Interaction[];

  /**
   * A relationship to the Project entity representing the user's projects.
   */
  @ManyToMany(() => Project, (project) => project.users)
  projects: Project[];
}
