import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { User } from "../users/user.entity";
import { Field } from "../fields/field.entity";
import { CardTypeLayout } from "@tillywork/shared";

/**
 * This is where entities like Task are derived from Card entity.
 */
@Entity()
export class CardType {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @ManyToOne(() => Workspace, (workspace) => workspace.cardTypes, {
        nullable: false,
    })
    workspace: Relation<Workspace>;

    @OneToMany(() => Field, (field) => field.cardType, {
        nullable: true,
        onDelete: "CASCADE",
    })
    fields: Relation<Field[]>;

    /**
     * Template string for generating card titles.
     * Uses mustache-style syntax: {{fieldSlug}}
     * Example: "{{firstName}} {{lastName}}" for contacts
     * If not set, falls back to the field marked as isTitle
     */
    @Column({ type: "varchar", length: 255, nullable: true })
    titleTemplate: string;

    @Column({
        type: "boolean",
        default: false,
    })
    hasChildren: boolean;

    @Column({
        type: "enum",
        enum: CardTypeLayout,
        default: CardTypeLayout.DEFAULT,
    })
    layout: CardTypeLayout;

    @Column({ type: "enum", enum: ["system", "user"], default: "user" })
    createdByType: "system" | "user";

    @ManyToOne(() => User, { eager: true })
    createdBy: Relation<User>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
