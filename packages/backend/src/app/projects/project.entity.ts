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
import { Contact } from '../contacts/contact.entity';
import { Space } from '../spaces/space.entity';

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

    @ManyToOne(() => Space, (space) => space.project)
    @JoinTable()
    spaces: Space[];

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    users: User[];

    @OneToMany(() => Contact, (contact) => contact.project)
    contacts: Contact[];
}
