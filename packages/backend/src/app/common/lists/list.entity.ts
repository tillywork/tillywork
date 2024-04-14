import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinTable,
} from 'typeorm';
import { Space } from '../spaces/space.entity';
import { Card } from '../cards/card.entity';

@Entity()
export class List {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Space, (space) => space.lists)
    @JoinTable()
    space: Space;
    @Column({ type: 'bigint' })
    spaceId: number;

    @ManyToOne(() => Card, (card) => card.view)
    cards: Card[];
}
