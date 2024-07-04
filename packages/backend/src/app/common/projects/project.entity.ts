import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Relation,
} from "typeorm";
import { Workspace } from "../workspaces/workspace.entity";
import { ProjectUser } from "./project-users/project.user.entity";

@Entity()
export class Project {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "bigint" })
    ownerId: number;

    @Column({ type: "varchar", length: 32, nullable: true })
    inviteCode: string;

    @Column({ type: "bigint", default: 1024 * 1024 * 1024 })
    userUploadLimit: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @OneToMany(() => ProjectUser, (user) => user.project)
    users: Relation<ProjectUser[]>;

    @OneToMany(() => Workspace, (workspace) => workspace.project)
    workspaces: Relation<Workspace[]>;
}
