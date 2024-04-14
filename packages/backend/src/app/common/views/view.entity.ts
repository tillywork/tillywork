import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinTable,
} from 'typeorm';
import { ViewTypes } from './types';
import { Space } from '../spaces/space.entity';
import { Card } from '../cards/card.entity';

@Entity()
export class View {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: ViewTypes, default: ViewTypes.LIST })
    viewType: ViewTypes;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Space, (space) => space.views)
    space: Space;

    @ManyToOne(() => Card, (card) => card.view)
    @JoinTable()
    cards: Card[];
}
