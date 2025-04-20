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
import {
    ActivityContent,
    ActivityType,
    CreatedByType,
} from "@tillywork/shared";

@Entity()
export class CardActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Card, (card) => card.activities, {
        nullable: false,
        cascade: true,
    })
    card: Relation<Card>;

    @Column({
        type: "enum",
        enum: ActivityType,
    })
    type: ActivityType;

    @Column("jsonb")
    content: ActivityContent;

    @Column({ type: "varchar", default: "system" })
    createdByType: CreatedByType;

    @ManyToOne(() => User, { nullable: true })
    createdBy?: Relation<User>;

    @CreateDateColumn()
    createdAt: Date;
}
