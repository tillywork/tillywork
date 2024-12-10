import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListsController } from "./lists.controller";
import { ListsService } from "./lists.service";
import { List } from "./list.entity";
import { ListSideEffectsService } from "./list.side.effects.service";
import { ListGroupsModule } from "./list-groups/list.groups.module";
import { ListStagesModule } from "./list-stages/list.stages.module";
import { ViewsModule } from "../views/views.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([List]),
        ListGroupsModule,
        ListStagesModule,
        ViewsModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [ListsController],
    providers: [ListsService, ListSideEffectsService],
    exports: [ListsService, ListSideEffectsService],
})
export class ListsModule {}
