import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { Workspace } from "./workspace.entity";
import { SpacesModule } from "../spaces/spaces.module";
import { WorkspaceSideEffectsService } from "./workspace.side.effects.service";

@Module({
    imports: [TypeOrmModule.forFeature([Workspace]), SpacesModule],
    controllers: [WorkspacesController],
    providers: [WorkspacesService, WorkspaceSideEffectsService],
    exports: [WorkspacesService, WorkspaceSideEffectsService],
})
export class WorkspacesModule {}
