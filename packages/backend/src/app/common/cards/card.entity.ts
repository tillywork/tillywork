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
} from "typeorm";
import { CardList } from "./card.list.entity";
import { User } from "../users/user.entity";

@Entity()
export class Card {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    title: string;

    @Column({ type: "varchar", nullable: true })
    description?: string;

    @Column({ type: "timestamp", nullable: true })
    dueAt: Date;

    @Column({ type: "jsonb", default: {} })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;

    @OneToMany(() => CardList, (cardList) => cardList.card)
    cardLists: CardList[];

    @ManyToMany(() => User, (user) => user.cards)
    @JoinTable({ name: "card_users" })
    users: User[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}