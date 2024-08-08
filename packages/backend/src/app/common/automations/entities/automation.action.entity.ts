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
import { ActionType } from "../types";
import { Automation } from "./automation.entity";

@Entity()
export class AutomationAction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "enum", enum: ActionType })
    type: ActionType;

    @Column({ type: "jsonb" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;

    @ManyToOne(() => Automation, { nullable: false })
    automation: Relation<Automation>;

    @OneToOne(() => AutomationAction)
    @JoinColumn()
    nextAction: Relation<AutomationAction>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
