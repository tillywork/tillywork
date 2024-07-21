import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Relation,
} from "typeorm";
import { ProjectUser } from "../project-users/project.user.entity";
import { Workspace } from "../../workspaces/workspace.entity";
import {
    ProjectUserActivityEntityTypes,
    ProjectUserActivityTypes,
} from "../types";

@Entity()
export class ProjectUserActivity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => ProjectUser, (projectUser) => projectUser.activities)
    projectUser: Relation<ProjectUser>;

    @Column({ type: "bigint" })
    projectUserId: number;

    @ManyToOne(() => Workspace, (workspace) => workspace.projectUserActivities)
    workspace: Relation<Workspace>;

    @Column({ type: "bigint" })
    workspaceId: number;

    @Column({ type: "enum", enum: ProjectUserActivityTypes })
    type: ProjectUserActivityTypes;

    @Column({ type: "bigint" })
    entityId: number;

    @Column({ type: "enum", enum: ProjectUserActivityEntityTypes })
    entityType: ProjectUserActivityEntityTypes;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
