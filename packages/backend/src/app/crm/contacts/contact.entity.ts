import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    DeleteDateColumn,
} from "typeorm";
import { User } from "../../common/users/user.entity";
import { Project } from "../../common/projects/project.entity";
import { Note } from "../notes/note.entity";

@Entity()
export class Contact {
    /**
     * The unique identifier for the contact.
     * Auto-incremented integer or generated UUID are common practices.
     */
    @PrimaryGeneratedColumn("increment")
    id: number;

    /**
     * The contact's first name. This is a mandatory field.
     */
    @Column({ type: "varchar", length: 255, nullable: true })
    firstName: string;

    /**
     * The contact's last name. This is a mandatory field.
     */
    @Column({ type: "varchar", length: 255, nullable: true })
    lastName: string;

    /**
     * The contact's email addresses.
     */
    @Column({ array: true, type: "varchar", length: 255, default: [], nullable: false })
    emails: string[];

    /**
     * The contact's primary phone number. Optional field.
     */
    @Column({ type: "varchar", length: 255, nullable: true })
    phoneNumber?: string;

    /**
     * CRM Management fields.
     */
    @ManyToOne(() => User, (user) => user.contacts, { nullable: true })
    @JoinColumn()
    owner?: User;

    @Column({ type: "bigint" })
    projectId: number;

    @ManyToOne(() => Project, (project) => project.contacts)
    @JoinColumn()
    project: Project;

    @OneToMany(() => Note, (note) => note.entityId, { nullable: true })
    notes?: string;

    /**
     * System generated timestamps for record keeping.
     */
    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamptz" })
    deletedAt: Date;
}
