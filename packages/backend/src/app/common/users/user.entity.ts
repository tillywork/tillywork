import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    DeleteDateColumn,
} from "typeorm";
import { Project } from "../projects/project.entity";
import { Card } from "../cards/card.entity";

@Entity()
export class User {
    /**
     * The unique identifier for the user.
     */
    @PrimaryGeneratedColumn("increment")
    id: number;

    /**
     * The user's email address. It can also be set to unique if you desire.
     */
    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    /**
     * The hashed password for the user. It is stored in a secure way using bcrypt.
     */
    @Column({ type: "varchar", length: 255, select: false })
    password: string;

    /**
     * The first name of the user.
     */
    @Column({ type: "varchar", length: 255 })
    firstName: string;

    /**
     * The last name of the user.
     */
    @Column({ type: "varchar", length: 255 })
    lastName: string;

    /**
     * The user's phone number.
     */
    @Column("varchar")
    phoneNumber: string;

    /**
     * The user's country (ISO2 code)
     */
    @Column({ type: "char", length: 2, nullable: true })
    country: string;

    /**
     * The photo URL of the user.
     */
    @Column({ type: "varchar", length: 255, nullable: true })
    photo: string;

    /**
     * The roles assigned to the user. It can represent different permission levels.
     */
    @Column({ type: "simple-array", default: ["user"] })
    roles: string[];

    /**
     * Holds general data from the user's onboarding
     */
    @Column({ type: "jsonb", default: {}, nullable: true })
    onboarding: any;

    /**
     * A timestamp representing when the user account was created.
     */
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    /**
     * A timestamp representing when the user account was last updated.
     */
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @DeleteDateColumn({ type: "timestamp" })
    deletedAt: Date;

    /**
     * A relationship to the Project entity representing the user's projects.
     */
    @ManyToMany(() => Project, (project) => project.users)
    projects: Project[];

    /**
     * A relationship to the Project entity representing the user's projects.
     */
    @ManyToMany(() => Card, (card) => card.users)
    cards: Card[];
}
