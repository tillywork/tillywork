import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinTable,
    OneToMany,
    Relation,
} from "typeorm";
import { CardList } from "../../cards/card-lists/card.list.entity";
import { List } from "../list.entity";

@Entity()
export class ListStage {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255 })
    color: string;

    @Column({ type: "int" })
    order: number;

    /**
     * When set to true, sets card
     * as closed when it is moved to it.
     */
    @Column({ type: "boolean", default: false })
    isCompleted: boolean;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.listStages, { onDelete: "CASCADE" })
    @JoinTable()
    list: Relation<List>;
    @Column({ type: "bigint" })
    listId: number;

    @OneToMany(() => CardList, (cardList) => cardList.listStage)
    cardLists: Relation<CardList[]>;
}
