import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { TWFileType } from "./types";
import { Project } from "../projects/project.entity";

@Entity("file")
export class TWFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** The original file name, used for display on the frontend. */
    @Column({ type: "varchar" })
    name: string;

    /** The file name prepended with upload time timestamp. */
    @Column({ type: "varchar", unique: true })
    key: string;

    /** The full URL of the file. */
    @Column({ type: "varchar", nullable: true })
    url: string;

    /** Used to render image and other files differently. */
    @Column({ type: "enum", enum: TWFileType })
    type: TWFileType;

    /** Holds file size in bytes. */
    @Column({ type: "bigint" })
    size: number;

    @ManyToOne(() => User, { nullable: false })
    createdBy: Relation<User>;

    @ManyToOne(() => Project, { nullable: false })
    project: Relation<Project>;

    @CreateDateColumn({ type: "timestamp", default: "now()" })
    createdAt: Date;
    @UpdateDateColumn({ type: "timestamp", default: "now()" })
    updatedAt: Date;
    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;
}
