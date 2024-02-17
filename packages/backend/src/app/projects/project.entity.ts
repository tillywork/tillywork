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
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';

@Entity()
export class Project {
  /**
   * The unique identifier for the user.
   */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /**
   * The username for the user. It is unique across the system.
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * The ID of the project owner.
   */
  @Column({ type: 'bigint' })
  ownerId: number;

  /**
   * A relationship to the Project entity representing contacts created in the project.
   */
  @OneToMany(() => Contact, (contact) => contact.project)
  contacts: Contact[];

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
   * A relationship to the User entity representing users of the project.
   */
  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  users: User[];
}
