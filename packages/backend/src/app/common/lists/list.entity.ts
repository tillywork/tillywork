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
import { Space } from "../spaces/space.entity";
import { CardList } from "../cards/card-lists/card.list.entity";
import { ListStage } from "./list-stages/list.stage.entity";
import { View } from "../views/view.entity";
import { Prop } from "../props/prop.entity";
import { ListGroup } from "./list-groups/list.group.entity";

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
    space: Relation<Space>;
    @Column({ type: "bigint" })
    spaceId: number;

    @OneToMany(() => ListStage, (listStage) => listStage.list)
    listStages: Relation<ListStage[]>;

    @OneToMany(() => ListGroup, (listGroup) => listGroup.list)
    listGroups: Relation<ListGroup[]>;

    @OneToMany(() => CardList, (cardList) => cardList.list)
    cardLists: Relation<CardList[]>;

    @OneToMany(() => View, (view) => view.list)
    views: Relation<View[]>;

    @OneToMany(() => Prop, (prop) => prop.list)
    props: Relation<Prop[]>;
}
