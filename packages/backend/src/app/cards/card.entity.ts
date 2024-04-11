import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { View } from '../views/view.entity';

@Entity()
export class Card {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'jsonb' })
    attributes: any;

    @ManyToOne(() => View, (view) => view.cards, { nullable: false })
    view: View;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
