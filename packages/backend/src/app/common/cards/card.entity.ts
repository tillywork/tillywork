import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { CardActivity } from "./card-activities/card.activity.entity";
import { CardList } from "./card-lists/card.list.entity";
import { CardType } from "../card-types/card.type.entity";
import { Workspace } from "../workspaces/workspace.entity";
import { CreatedByType } from "@tillywork/shared";

@Entity()
export class Card {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => CardType, { nullable: false, eager: true })
    type: Relation<CardType>;

    @Column({ type: "jsonb", default: {} })
    data: Record<number, any>;

    @Column({ type: "varchar", default: "system" })
    createdByType: CreatedByType;

    @OneToMany(() => CardList, (cardList) => cardList.card, {
        onDelete: "CASCADE",
    })
    cardLists: Relation<CardList[]>;

    @ManyToMany(() => User, (user) => user.cards)
    @JoinTable({ name: "card_users" })
    users: Relation<User[]>;

    @OneToMany(() => CardActivity, (cardActivity) => cardActivity.card)
    activities: Relation<CardActivity[]>;

    @ManyToOne(() => User)
    createdBy: Relation<User>;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    @ManyToOne(() => Card, (card) => card.children)
    @JoinColumn({ name: "parentId" })
    parent?: Relation<Card>;
    @OneToMany(() => Card, (card) => card.parent)
    children: Relation<Card[]>;

    @ManyToOne(() => Workspace, { onDelete: "CASCADE" })
    workspace: Relation<Workspace>;

    @Column({ type: "bigint" })
    workspaceId: number;
}
