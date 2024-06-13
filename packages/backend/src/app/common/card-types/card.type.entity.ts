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
import { User } from "../users/user.entity";

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
