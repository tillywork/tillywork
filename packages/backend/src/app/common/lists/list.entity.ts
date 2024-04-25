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
import { Space } from "../spaces/space.entity";
import { CardList } from "../cards/card.list.entity";
import { ListStage } from "./list.stage.entity";
import { View } from "../views/view.entity";

@Entity()
export class List {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @ManyToOne(() => Space, (space) => space.lists)
    @JoinTable()
    space: Space;
    @Column({ type: "bigint" })
    spaceId: number;

    @OneToMany(() => ListStage, (listStage) => listStage.list)
    listStages: ListStage[];

    @OneToMany(() => CardList, (cardList) => cardList.list)
    cardLists: CardList[];

    @OneToMany(() => View, (view) => view.list)
    views: View[];
}
