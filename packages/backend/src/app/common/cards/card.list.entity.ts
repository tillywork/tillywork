import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Card } from "../cards/card.entity";
import { List } from "../lists/list.entity";
import { ListStage } from "../lists/list.stage.entity";

@Entity()
export class CardList {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => ListStage, (listStage) => listStage.cardLists, {
        nullable: false,
    })
    listStage: ListStage;
    @Column({ type: "bigint", nullable: false })
    listStageId: number;

    @ManyToOne(() => Card, (card) => card.cardLists, { nullable: false })
    card: Card;

    @ManyToOne(() => List, (list) => list.cardLists, {
        nullable: false,
        onDelete: "CASCADE",
    })
    list: List;
    @Column({ type: "bigint", nullable: false })
    listId: number;
}
