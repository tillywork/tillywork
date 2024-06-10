import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";

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

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
