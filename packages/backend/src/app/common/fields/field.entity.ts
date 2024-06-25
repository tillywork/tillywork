import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Relation,
    DeleteDateColumn,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { FieldItem, FieldTypes } from "./types";
import { User } from "../users/user.entity";

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
}
