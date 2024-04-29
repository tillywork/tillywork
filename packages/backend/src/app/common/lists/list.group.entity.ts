import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { List } from "./list.entity";
import { ListGroupOptions } from "./types";

@Entity()
export class ListGroup {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "bigint", nullable: true })
    entityId: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: ListGroupOptions })
    type: ListGroupOptions;

    @Column({ type: "boolean", default: true })
    isExpanded: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.listGroups, { nullable: false })
    @JoinColumn()
    list: List;
}
