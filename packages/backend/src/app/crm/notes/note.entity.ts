import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    DeleteDateColumn,
} from "typeorm";
import { Contact } from "../contacts/contact.entity";

export enum NoteEntityType {
    CONTACT = "contact",
    ORGANIZATION = "organization",
}

@Entity()
export class Note {
    /**
     * The unique identifier for the note.
     * Auto-incremented integer or generated UUID are common practices.
     */
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "text" })
    note: string;

    /**
     * Polymorphic relationship fields.
     */
    @Column({ type: "varchar" })
    entityType: NoteEntityType; // Stores the type of the associated entity
    @Column({ type: "bigint" })
    entityId: number; // Stores the ID of the associated entity

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
