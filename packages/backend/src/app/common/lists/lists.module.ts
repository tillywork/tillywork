import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListsController } from "./lists.controller";
import { ListsService } from "./lists.service";
import { List } from "./list.entity";
import { ListStage } from "./list.stage.entity";
import { ListStagesService } from "./list.stages.service";
import { ListGroup } from "./list.group.entity";
import { ListGroupsService } from "./list.groups.service";
import { UsersModule } from "../users/users.module";
import { CardsModule } from "../cards/cards.module";
import { ListSideEffectsService } from "./list.side.effects.service";
import { ViewsModule } from "../views/views.module";
import { FiltersModule } from "../filters/filters.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([List, ListStage, ListGroup]),
        UsersModule,
        CardsModule,
        ViewsModule,
        FiltersModule,
    ],
    controllers: [ListsController],
    providers: [
        ListsService,
        ListStagesService,
        ListGroupsService,
        ListSideEffectsService,
    ],
    exports: [
        ListsService,
        ListStagesService,
        ListGroupsService,
        ListSideEffectsService,
    ],
})
export class ListsModule {}
