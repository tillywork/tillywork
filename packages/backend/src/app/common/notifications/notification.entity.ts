import { NotificationType } from "@tillywork/shared";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { User } from "../users/user.entity";
import { Workspace } from "../workspaces/workspace.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ type: "varchar", nullable: true })
    relatedResourceId?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    relatedResourceType?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    color?: string;

    @Column({ type: "text" })
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    recipient: User;

    @ManyToOne(() => Workspace, { onDelete: "CASCADE" })
    workspace: Workspace;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
