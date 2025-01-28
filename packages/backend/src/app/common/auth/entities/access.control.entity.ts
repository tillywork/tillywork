import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "../../users/user.entity";
import { List } from "../../lists/list.entity";
import { Project } from "../../projects/project.entity";
import { Space } from "../../spaces/space.entity";
import { Workspace } from "../../workspaces/workspace.entity";
import { PermissionLevel } from "@tillywork/shared";

@Entity()
export class AccessControl {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column({
        type: "enum",
        enum: PermissionLevel,
        default: PermissionLevel.NONE,
    })
    permissionLevel: PermissionLevel;

    // Optional relations - only one should be set for a given access control entry
    @ManyToOne(() => Project, { nullable: true })
    project?: Project;

    @ManyToOne(() => Workspace, { nullable: true })
    workspace?: Workspace;

    @ManyToOne(() => Space, { nullable: true })
    space?: Space;

    @ManyToOne(() => List, { nullable: true })
    list?: List;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
