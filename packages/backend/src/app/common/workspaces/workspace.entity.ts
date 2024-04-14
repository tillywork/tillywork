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
import { Project } from '../projects/project.entity';
import { WorkspaceTypes } from './types';

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'bigint' })
    ownerId: number;

    @Column({ type: 'enum', enum: WorkspaceTypes })
    workspaceType: WorkspaceTypes;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Project, (project) => project.workspaces)
    @JoinTable()
    project: Project[];
    @Column({ type: 'bigint', nullable: true })
    projectId: number;

    @OneToMany(() => Space, (space) => space.workspace)
    spaces: Space[];

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    users: User[];

    @OneToMany(() => Contact, (contact) => contact.project)
    contacts: Contact[];
}
