import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { Workspace } from "./workspace.entity";
import { SpacesModule } from "../spaces/spaces.module";
import { WorkspaceSideEffectsService } from "./workspace.side.effects.service";
import { CardTypesModule } from "../card-types/card.types.module";
import { AuthModule } from "../auth/auth.module";
import { ListsModule } from "../lists/lists.module";
import { ViewsModule } from "../views/views.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Workspace]),
        SpacesModule,
        CardTypesModule,
        forwardRef(() => AuthModule),
        forwardRef(() => CardTypesModule),
        ListsModule,
        ViewsModule,
    ],
    controllers: [WorkspacesController],
    providers: [WorkspacesService, WorkspaceSideEffectsService],
    exports: [WorkspacesService, WorkspaceSideEffectsService],
})
export class WorkspacesModule {}
