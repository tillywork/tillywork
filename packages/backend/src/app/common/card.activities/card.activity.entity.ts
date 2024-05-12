import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Card } from "../cards/card.entity";
import { User } from "../users/user.entity";

export enum ActivityType {
    UPDATE = "UPDATE",
    COMMENT = "COMMENT",
}

export type ActivityContent = {
    [key: string]: any;
};

@Entity()
export class CardActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Card, (card) => card.activities, { nullable: false })
    card: Card;

    @Column({
        type: "enum",
        enum: ActivityType,
    })
    type: ActivityType;

    @Column("jsonb")
    content: ActivityContent;

    @ManyToOne(() => User)
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
