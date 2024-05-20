import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListStagesController } from "./list.stages.controller";
import { ListStage } from "./list.stage.entity";
import { ListStagesService } from "./list.stages.service";

@Module({
    imports: [TypeOrmModule.forFeature([ListStage])],
    controllers: [ListStagesController],
    providers: [ListStagesService],
    exports: [ListStagesService],
})
export class ListStagesModule {}
