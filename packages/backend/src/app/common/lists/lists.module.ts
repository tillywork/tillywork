import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListsController } from "./lists.controller";
import { ListsService } from "./lists.service";
import { List } from "./list.entity";
import { ListStage } from "./list.stage.entity";
import { ListStagesService } from "./list.stages.service";

@Module({
    imports: [TypeOrmModule.forFeature([List, ListStage])],
    controllers: [ListsController],
    providers: [ListsService, ListStagesService],
    exports: [ListsService, ListStagesService],
})
export class ListsModule {}
