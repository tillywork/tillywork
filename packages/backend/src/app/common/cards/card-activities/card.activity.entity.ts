import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Relation,
} from "typeorm";
import { Card } from "../card.entity";
import { User } from "../../users/user.entity";

export enum ActivityType {
    UPDATE = "UPDATE",
    COMMENT = "COMMENT",
}

export type ActivityContent = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

@Entity()
export class CardActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Card, (card) => card.activities, { nullable: false })
    card: Relation<Card>;

    @Column({
        type: "enum",
        enum: ActivityType,
    })
    type: ActivityType;

    @Column("jsonb")
    content: ActivityContent;

    @ManyToOne(() => User)
    createdBy: Relation<User>;

    @CreateDateColumn()
    createdAt: Date;
}
