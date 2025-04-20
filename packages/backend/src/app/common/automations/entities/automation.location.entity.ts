import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";

import { Automation } from "./automation.entity";
import { List } from "../../lists/list.entity";
import { Space } from "../../spaces/space.entity";

import { LocationType } from "@tillywork/shared";

@Entity()
export class AutomationLocation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "bigint" })
    locationId: number;

    @Column({ type: "enum", enum: LocationType })
    locationType: LocationType;

    @ManyToOne(() => Automation, {
        nullable: false,
        onDelete: "CASCADE",
    })
    automation: Relation<Automation>;

    @Exclude()
    @ManyToOne(() => Space, { nullable: true })
    @JoinColumn({ name: "locationId", referencedColumnName: "id" })
    space: Relation<Space>;

    @Exclude()
    @ManyToOne(() => List, { nullable: true })
    @JoinColumn({ name: "locationId", referencedColumnName: "id" })
    list: Relation<List>;

    @Expose()
    get location(): Space | List | null {
        return this.locationType === LocationType.SPACE
            ? this.space
            : this.list;
    }

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
