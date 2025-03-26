import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";

import { AutomationStep } from "./automation.step.entity";
import { AutomationLocation } from "./automation.location.entity";
import { Workspace } from "../../workspaces/workspace.entity";
import { User } from "../../users/user.entity";

@Entity()
export class Automation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "boolean", default: false })
    isEnabled: boolean;

    @OneToOne(() => AutomationStep)
    @JoinColumn()
    trigger: Relation<AutomationStep>;

    /** Virtual column to load steps through the linked list. */
    steps?: Relation<AutomationStep[]>;

    @OneToMany(() => AutomationLocation, (location) => location.automation, {
        cascade: true,
    })
    locations: Relation<AutomationLocation[]>;

    @ManyToOne(() => Workspace, {
        nullable: false,
        eager: true,
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
