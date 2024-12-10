import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne,
    DeleteDateColumn,
    Relation,
} from "typeorm";
import { User } from "../users/user.entity";
import { Space } from "../spaces/space.entity";
import { Project } from "../projects/project.entity";
import { WorkspaceTypes } from "./types";
import { CardType } from "../card-types/card.type.entity";
import { AccessType } from "@tillywork/shared";

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "bigint" })
    ownerId: number;

    @Column({ type: "enum", enum: WorkspaceTypes })
    type: WorkspaceTypes;

    @Column({ type: "enum", enum: AccessType, default: AccessType.PUBLIC })
    accessType: AccessType;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToOne(() => Project, (project) => project.workspaces)
    @JoinTable()
    project: Relation<Project[]>;
    @Column({ type: "bigint", nullable: true })
    projectId: number;

    @OneToMany(() => Space, (space) => space.workspace)
    spaces: Relation<Space[]>;

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    users: Relation<User[]>;

    @OneToMany(() => CardType, (cardType) => cardType.workspace, {
        eager: true,
    })
    cardTypes: Relation<CardType[]>;

    @ManyToOne(() => CardType, { eager: true })
    defaultCardType: Relation<CardType>;
}
