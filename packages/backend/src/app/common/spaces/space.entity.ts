import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { List } from '../lists/list.entity';

@Entity()
export class Space {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
  
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.spaces)
  @JoinTable()
  workspace: Workspace;
  @Column({ type: 'bigint', nullable: false })
  workspaceId: number;

  @OneToMany(() => List, (list) => list.space)
  lists: List[];
}
