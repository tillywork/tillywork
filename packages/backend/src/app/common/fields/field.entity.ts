import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Relation,
    DeleteDateColumn,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { FieldItem, FieldTypes } from "./types";
import { User } from "../users/user.entity";
import { List } from "../lists/list.entity";
import { CardType } from "../card-types/card.type.entity";

/**
 * This contains card fields.
 */
@Entity()
export class Field {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: FieldTypes })
    type: FieldTypes;

    @Column({ type: "varchar", length: 255 })
    icon: string;

    @Column({ type: "boolean", default: false })
    required: boolean;

    @Column({ type: "boolean", default: true })
    multiple: boolean;

    /** Contains the items for dropdown fields. */
    @Column({ type: "jsonb", nullable: true })
    items?: FieldItem[];

    @ManyToOne(() => CardType, { onDelete: "CASCADE", eager: true })
    cardType: Relation<CardType>;

    @Column({ type: "enum", enum: ["system", "user"], default: "system" })
    createdByType: "system" | "user";

    @ManyToOne(() => User, { eager: true })
    createdBy: Relation<User>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp", nullable: true })
    deletedAt: Date;

    @ManyToOne(() => Workspace, {
        nullable: false,
    })
    workspace: Relation<Workspace>;

    @ManyToMany(() => List)
    @JoinTable({ name: "list_fields" })
    lists: Relation<List[]>;
}
