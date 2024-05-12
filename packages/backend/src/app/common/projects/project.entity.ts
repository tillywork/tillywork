import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Contact } from '../../crm/contacts/contact.entity';
import { Space } from '../spaces/space.entity';
import { ProjectTypes } from './types';
import { Workspace } from '../workspaces/workspace.entity';

@Entity()
export class Project {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'bigint' })
    ownerId: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    users: User[];

    @OneToMany(() => Contact, (contact) => contact.project)
    contacts: Contact[];

    @OneToMany(() => Workspace, (workspace) => workspace.project)
    workspaces: Workspace[];
}
