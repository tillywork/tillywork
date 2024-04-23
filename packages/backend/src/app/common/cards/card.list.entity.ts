import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Card } from "../cards/card.entity";
import { List } from "../lists/list.entity";
import { ListStage } from "../lists/list.stage.entity";

@Entity()
export class CardList {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => ListStage, (listStage) => listStage.cardLists)
    listStage: ListStage;
    @Column({ type: "bigint" })
    listStageId: number;

    @ManyToOne(() => Card, (card) => card.cardLists)
    card: Card;

    @ManyToOne(() => List, (list) => list.cardLists)
    list: List;
}
