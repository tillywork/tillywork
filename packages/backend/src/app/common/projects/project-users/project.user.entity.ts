import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import { User } from "../../users/user.entity";
import { Project } from "../project.entity";
import { ProjectUserActivity } from "../project-user-activities/project.user.activity.entity";

@Entity()
export class ProjectUser {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    role: string;

    @ManyToOne(() => User, (user) => user.projects, {
        nullable: false,
        eager: true,
    })
    user: Relation<User>;

    @ManyToOne(() => Project, (project) => project.users, { nullable: false })
    project: Relation<Project>;

    @OneToMany(() => ProjectUserActivity, (activity) => activity.projectUser)
    activities: Relation<ProjectUserActivity[]>;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
