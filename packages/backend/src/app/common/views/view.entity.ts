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
import { ViewTypes } from "./types";
import { List } from "../lists/list.entity";
import { QueryFilter } from "../filters/types";
import { ListGroupOptions, ViewOptions } from "@tillywork/shared";

@Entity()
export class View {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: ViewTypes, default: ViewTypes.TABLE })
    type: ViewTypes;

    @Column({
        type: "jsonb",
        default: {
            groupBy: {
                type: ListGroupOptions.LIST_STAGE,
            },
            hideCompleted: true,
        },
    })
    options: ViewOptions;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.views, { onDelete: "CASCADE" })
    @JoinColumn()
    list: Relation<List>;

    @Column({ type: "bigint" })
    listId: number;

    filters?: QueryFilter;
}
