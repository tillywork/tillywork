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

@Module({
    imports: [TypeOrmModule.forFeature([List, ListStage, ListGroup]), UsersModule, CardsModule],
    controllers: [ListsController],
    providers: [ListsService, ListStagesService, ListGroupsService],
    exports: [ListsService, ListStagesService, ListGroupsService],
})
export class ListsModule {}
