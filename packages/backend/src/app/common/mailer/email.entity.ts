import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { EmailStatus } from "./types";

@Entity()
export class Email {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    to: string;

    @Column()
    subject: string;

    @Column("text")
    body: string;

    @Column({
        type: "enum",
        enum: EmailStatus,
        default: EmailStatus.PENDING,
    })
    status: EmailStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
