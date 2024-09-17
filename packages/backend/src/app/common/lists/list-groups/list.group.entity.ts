import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Relation,
} from "typeorm";
import { List } from "../list.entity";
import { Field } from "../../fields/field.entity";
import { ListGroupEntityTypes } from "../types";
import { ListGroupOptions, QueryFilter } from "@tillywork/shared";

@Entity()
export class ListGroup {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: ListGroupOptions })
    type: ListGroupOptions;

    @Column({ type: "bigint", nullable: true })
    entityId: number;

    @Column({ type: "enum", enum: ListGroupEntityTypes, nullable: true })
    entityType: ListGroupEntityTypes;

    /** TODO move this to view level */
    @Column({ type: "boolean", default: true })
    isExpanded: boolean;

    @Column({ type: "varchar", nullable: true })
    color: string;

    @Column({ type: "int" })
    order: number;

    @Column({ type: "varchar", nullable: true })
    icon: string;

    @Column({ type: "jsonb", nullable: true })
    filter?: QueryFilter;

    @ManyToOne(() => Field, { nullable: false })
    field: Relation<Field>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.listGroups, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn()
    list: Relation<List>;
}
