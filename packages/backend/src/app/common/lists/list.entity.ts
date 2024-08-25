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
    ManyToMany,
    DeleteDateColumn,
} from "typeorm";
import { Space } from "../spaces/space.entity";
import { CardList } from "../cards/card-lists/card.list.entity";
import { ListStage } from "./list-stages/list.stage.entity";
import { View } from "../views/view.entity";
import { ListGroup } from "./list-groups/list.group.entity";
import { CardType } from "../card-types/card.type.entity";
import { Field } from "../fields/field.entity";
import { Workspace } from "../workspaces/workspace.entity";

@Entity()
export class List {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255, default: "mdi-list-box-outline" })
    icon: string;

    @Column({ type: "varchar", length: 255, default: "default" })
    iconColor: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt?: Date;

    @ManyToOne(() => Space, { nullable: true, onDelete: "CASCADE" })
    @JoinTable()
    space: Relation<Space>;
    @Column({ type: "bigint" })
    spaceId: number;

    @ManyToOne(() => Workspace, { nullable: true })
    @JoinTable()
    workspace: Relation<Workspace>;
    @Column({ type: "bigint" })
    workspaceId: number;

    @OneToMany(() => ListStage, (listStage) => listStage.list)
    listStages: Relation<ListStage[]>;

    @OneToMany(() => ListGroup, (listGroup) => listGroup.list)
    listGroups: Relation<ListGroup[]>;

    @OneToMany(() => CardList, (cardList) => cardList.list)
    cardLists: Relation<CardList[]>;

    @OneToMany(() => View, (view) => view.list)
    views: Relation<View[]>;

    @ManyToOne(() => CardType, { nullable: false, eager: true })
    defaultCardType: Relation<CardType>;

    @ManyToMany(() => Field, { onDelete: "CASCADE" })
    fields: Relation<Field[]>;
}
