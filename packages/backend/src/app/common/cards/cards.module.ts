import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { Card } from "./card.entity";
import { CardList } from "./card.list.entity";
import { CardListsService } from "./card.lists.service";

@Module({
    imports: [TypeOrmModule.forFeature([Card, CardList])],
    controllers: [CardsController],
    providers: [CardsService, CardListsService],
    exports: [CardsService, CardListsService],
})
export class CardsModule {}
