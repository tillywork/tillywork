import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinTable,
    OneToMany,
} from "typeorm";
import { CardList } from "../cards/card.list.entity";
import { List } from "./list.entity";

@Entity()
export class ListStage {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255 })
    color: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => List, (list) => list.listStages)
    @JoinTable()
    list: List;
    @Column({ type: "bigint" })
    listId: number;

    @OneToMany(() => CardList, (cardList) => cardList.listStage)
    cardLists: CardList[];
}
