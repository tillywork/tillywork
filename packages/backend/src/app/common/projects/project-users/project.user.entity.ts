import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Project } from "../project.entity";
import { User } from "../../users/user.entity";

@Entity()
export class ProjectUser {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => Project, (project) => project.users, { nullable: false })
    project: Project;

    @ManyToOne(() => User, (user) => user.projects, {
        nullable: false,
        eager: true,
    })
    user: User;

    @Column({ type: "varchar", length: 255 })
    role: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
