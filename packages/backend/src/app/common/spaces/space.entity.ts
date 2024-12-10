import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinTable,
    DeleteDateColumn,
    Relation,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { List } from "../lists/list.entity";
import { AccessType } from "@tillywork/shared";

@Entity()
export class Space {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255, default: "mdi-folder-outline" })
    icon: string;

    @Column({ type: "varchar", length: 255, default: "default" })
    iconColor: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: AccessType, default: AccessType.PUBLIC })
    accessType: AccessType;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToOne(() => Workspace, (workspace) => workspace.spaces, {
        onDelete: "CASCADE",
    })
    @JoinTable()
    workspace: Relation<Workspace>;
    @Column({ type: "bigint", nullable: false })
    workspaceId: number;

    @OneToMany(() => List, (list) => list.space)
    lists: Relation<List[]>;
}
