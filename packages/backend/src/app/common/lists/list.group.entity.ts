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
import { ListGroupEntityTypes, ListGroupOptions } from "./types";
import { Filter } from "../filters/filter.entity";
import { CardFindAllResult } from "../cards/cards.service";

@Entity()
export class ListGroup {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "bigint", nullable: true })
    entityId: number;

    @Column({ type: "enum", enum: ListGroupEntityTypes, nullable: true })
    entityType: ListGroupEntityTypes;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: ListGroupOptions })
    type: ListGroupOptions;

    @Column({ type: "boolean", default: true })
    isExpanded: boolean;

    @Column({ type: "varchar", nullable: true })
    color: string;

    @Column({ type: "varchar", nullable: true })
    icon: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.listGroups, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn()
    list: List;

    @Column({ type: "bigint" })
    listId: number;

    filter?: Filter;

    cards?: CardFindAllResult;
}
