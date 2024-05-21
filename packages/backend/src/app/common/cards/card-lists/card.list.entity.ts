import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Relation,
} from "typeorm";
import { Card } from "../card.entity";
import { List } from "../../lists/list.entity";
import { ListStage } from "../../lists/list-stages/list.stage.entity";

@Entity()
export class CardList {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => ListStage, (listStage) => listStage.cardLists, {
        nullable: false,
    })
    listStage: Relation<ListStage>;
    @Column({ type: "bigint", nullable: false })
    listStageId: number;

    @ManyToOne(() => Card, (card) => card.cardLists, { nullable: false })
    card: Relation<Card>;

    @ManyToOne(() => List, (list) => list.cardLists, {
        nullable: false,
        onDelete: "CASCADE",
    })
    list: Relation<List>;
    @Column({ type: "bigint", nullable: false })
    listId: number;
}
