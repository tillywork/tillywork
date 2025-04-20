import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";

import { Automation } from "./automation.entity";

import { AutomationRunError, AutomationRunStatus } from "@tillywork/shared";
import { AutomationStepRun } from "./automation.step.run.entity";

@Entity()
export class AutomationRun {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Automation)
    automation: Automation;

    @Column({ type: "varchar" })
    status: AutomationRunStatus;

    @Column({ type: "jsonb", nullable: true })
    error?: AutomationRunError;

    @CreateDateColumn()
    startedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => AutomationStepRun, (step) => step.run)
    steps: AutomationStepRun[];
}
