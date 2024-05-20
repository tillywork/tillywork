import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardActivity } from "./card.activity.entity";
import { CardActivitiesService } from "./card.activities.service";
import { CardActivitiesController } from "./card.activities.controller";

@Module({
    imports: [TypeOrmModule.forFeature([CardActivity])],
    controllers: [CardActivitiesController],
    providers: [CardActivitiesService],
    exports: [CardActivitiesService],
})
export class CardActivitiesModule {}
