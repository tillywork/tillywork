import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { WatchableResourceType } from "@tillywork/shared";

@Entity()
@Unique(["user", "resourceId", "resourceType"])
@Index(["resourceId", "resourceType"])
export class Watcher {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
    @Index()
    user: User;

    @Column({ type: "bigint", nullable: false })
    resourceId: number;

    @Column({ type: "enum", enum: WatchableResourceType, nullable: false })
    resourceType: WatchableResourceType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
