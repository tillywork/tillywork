import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    Relation,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { Automation } from "./automation.entity";
import { ActionType, AutomationStepType, TriggerType } from "@tillywork/shared";

@Entity()
export class AutomationStep {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "enum", enum: AutomationStepType })
    type: AutomationStepType;

    @Column({
        type: "varchar",
        enum: [TriggerType, ActionType],
        nullable: true,
    })
    value?: TriggerType | ActionType;

    @Column({ type: "jsonb" })
    data: Record<string, any>;

    @ManyToOne(() => Automation, { nullable: false })
    automation: Relation<Automation>;

    @OneToOne(() => AutomationStep)
    @JoinColumn()
    nextStep?: Relation<AutomationStep>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
