import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Relation,
} from "typeorm";
import { PropTypes } from "./types";
import { List } from "../lists/list.entity";

@Entity()
export class Prop {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "enum", enum: PropTypes })
    type: PropTypes;

    @Column({ type: "boolean", default: false })
    required: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.props, {
        nullable: false,
    })
    list: Relation<List>;
}
