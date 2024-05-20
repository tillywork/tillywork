import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListGroup } from "./list.group.entity";
import { ListGroupsService } from "./list.groups.service";
import { ListGroupsController } from "./list.groups.controller";
import { ListStagesModule } from "../list-stages/list.stages.module";
import { UsersModule } from "../../users/users.module";
import { CardsModule } from "../../cards/cards.module";
import { FiltersModule } from "../../filters/filters.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ListGroup]),
        ListStagesModule,
        UsersModule,
        CardsModule,
        FiltersModule,
    ],
    controllers: [ListGroupsController],
    providers: [ListGroupsService],
    exports: [ListGroupsService],
})
export class ListGroupsModule {}
