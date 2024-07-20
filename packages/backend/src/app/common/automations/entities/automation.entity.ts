import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { Workspace } from "../../workspaces/workspace.entity";
import { User } from "../../users/user.entity";
import { TriggerType } from "../types";
import { FieldFilter } from "../../filters/types";
import { AutomationAction } from "./automation.action.entity";

@Entity()
export class Automation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: TriggerType })
    triggerType: TriggerType;

    @Column({ type: "jsonb" })
    conditions: FieldFilter[];

    @OneToOne(() => AutomationAction, { eager: true })
    @JoinColumn()
    firstAction: Relation<AutomationAction>;

    @ManyToOne(() => Workspace, {
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
