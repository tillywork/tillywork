import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { FilterEntityTypes, FilterGroup, ViewFilter } from "./types";

@Entity()
export class Filter {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    name: string;

    @Column({ type: "jsonb" })
    where: FilterGroup | ViewFilter;

    @Column({ type: "bigint" })
    entityId: number;

    @Column({ type: "enum", enum: FilterEntityTypes })
    entityType: FilterEntityTypes;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
