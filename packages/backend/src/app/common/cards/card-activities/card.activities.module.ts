import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardActivity } from "./card.activity.entity";
import { CardActivitiesService } from "./card.activities.service";
import { CardActivitiesController } from "./card.activities.controller";
import { CardActivitySubscriber } from "./card.activity.subscriber";

@Module({
    imports: [TypeOrmModule.forFeature([CardActivity])],
    controllers: [CardActivitiesController],
    providers: [CardActivitiesService, CardActivitySubscriber],
    exports: [CardActivitiesService],
})
export class CardActivitiesModule {}
