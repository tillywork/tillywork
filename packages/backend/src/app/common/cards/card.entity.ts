/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    DeleteDateColumn,
    ManyToMany,
    JoinTable,
    ManyToOne,
} from "typeorm";
import { CardList } from "./card-lists/card.list.entity";
import { User } from "../users/user.entity";
import { CardActivity } from "./card-activities/card.activity.entity";

@Entity()
export class Card {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    title: string;

    @Column({ type: "jsonb", nullable: true })
    description?: any;

    @Column({ type: "timestamp", nullable: true })
    dueAt: Date;

    @Column({ type: "jsonb", default: {} })
    data: any;

    @OneToMany(() => CardList, (cardList) => cardList.card)
    cardLists: CardList[];

    @ManyToMany(() => User, (user) => user.cards)
    @JoinTable({ name: "card_users" })
    users: User[];

    @OneToMany(() => CardActivity, (cardActivity) => cardActivity.card)
    activities: CardActivity[];

    @ManyToOne(() => User)
    createdBy: User;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
