import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { ViewSortOption, ViewTypes } from "./types";
import { List } from "../lists/list.entity";
import { ListGroupOptions } from "../lists/types";

@Entity()
export class View {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: ViewTypes, default: ViewTypes.TABLE })
    type: ViewTypes;

    @Column({
        type: "enum",
        enum: ListGroupOptions,
        default: ListGroupOptions.LIST_STAGE,
    })
    groupBy: ListGroupOptions;

    @Column("jsonb", { nullable: true })
    sortBy: ViewSortOption;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.views, { onDelete: "CASCADE" })
    @JoinColumn()
    list: List;

    @Column({ type: "bigint" })
    listId: number;
}
