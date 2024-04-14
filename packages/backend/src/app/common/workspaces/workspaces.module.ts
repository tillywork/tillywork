import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './workspace.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Workspace]),
    ],
    controllers: [WorkspacesController],
    providers: [
        WorkspacesService,
    ],
    exports: [WorkspacesService],
})
export class WorkspacesModule { }
