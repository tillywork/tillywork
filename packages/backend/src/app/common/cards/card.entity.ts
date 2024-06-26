/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
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

@Entity()
export class Card {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    title: string;

    @Column({ type: "jsonb", nullable: true })
    description?: any;

    @Column({ type: "timestamp", nullable: true })
    startsAt: Date;
    @Column({ type: "timestamp", nullable: true })
    dueAt: Date;

    @ManyToOne(() => CardType, { nullable: false, eager: true })
    type: Relation<CardType>;

    @Column({ type: "jsonb", default: {} })
    data: Record<number, any>;

    @OneToMany(() => CardList, (cardList) => cardList.card)
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
}
