import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { Card } from "./card.entity";
import { CardSubscriber } from "./card.subscriber";
import { CardUserSubscriber } from "./card.user.subscriber";
import { CardListsModule } from "./card-lists/card.lists.module";
import { CardActivitiesModule } from "./card-activities/card.activities.module";
import { AutomationsModule } from "../automations/automations.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
        CardListsModule,
        CardActivitiesModule,
        forwardRef(() => AutomationsModule),
    ],
    controllers: [CardsController],
    providers: [CardsService, CardSubscriber, CardUserSubscriber],
    exports: [CardsService],
})
export class CardsModule {}
