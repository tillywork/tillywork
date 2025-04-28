import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/user.entity";
import { NotificationChannel } from "@tillywork/shared";

@Entity()
@Unique(["user", "channel"])
export class NotificationPreference {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;

    @Column({ type: "enum", enum: NotificationChannel })
    channel: NotificationChannel;

    @Column({ default: true })
    enabled: boolean;

    @Column({ type: "jsonb", default: {} })
    config: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
