import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardList } from "./card.list.entity";
import { CardListsService } from "./card.lists.service";
import { CardListssController } from "./card.lists.controller";
import { CardListSubscriber } from "./card.list.subscriber";

@Module({
    imports: [TypeOrmModule.forFeature([CardList])],
    controllers: [CardListssController],
    providers: [CardListsService, CardListSubscriber],
    exports: [CardListsService],
})
export class CardListsModule {}
