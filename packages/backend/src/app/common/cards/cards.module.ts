import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { Card } from "./card.entity";
import { CardSubscriber } from "./card.subscriber";
import { CardListsModule } from "./card-lists/card.lists.module";
import { CardActivitiesModule } from "./card-activities/card.activities.module";
import { AutomationsModule } from "../automations/automations.module";
import { AuthModule } from "../auth/auth.module";
import { CardsGateway } from "./cards.gateway";
import { CollaborationModule } from "../collaboration/collaboration.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
        CardListsModule,
        CardActivitiesModule,
        forwardRef(() => AutomationsModule),
        forwardRef(() => AuthModule),
        forwardRef(() => CollaborationModule),
    ],
    controllers: [CardsController],
    providers: [CardsService, CardSubscriber, CardsGateway],
    exports: [CardsService, CardActivitiesModule, CardListsModule],
})
export class CardsModule {}
