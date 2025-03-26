import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
} from "typeorm";

import { AutomationStep } from "./automation.step.entity";
import { AutomationRun } from "./automation.run.entity";

import { AutomationRunError, AutomationRunStatus } from "@tillywork/shared";

@Entity()
export class AutomationStepRun {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => AutomationRun)
    run: AutomationRun;

    @ManyToOne(() => AutomationStep)
    step: AutomationStep;

    @Column()
    order: number;

    @Column({ type: "jsonb", nullable: true })
    input: Record<string, any>;

    @Column({ type: "jsonb", nullable: true })
    output: any;

    @Column({ type: "varchar" })
    status: AutomationRunStatus;

    @Column({ type: "jsonb", nullable: true })
    error?: AutomationRunError;

    @CreateDateColumn()
    executedAt: Date;

    @Column({ type: "float", nullable: true })
    duration?: number;
}
