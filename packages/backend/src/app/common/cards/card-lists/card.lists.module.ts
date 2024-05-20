import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardList } from "./card.list.entity";
import { CardListsService } from "./card.lists.service";
import { CardListssController } from "./card.lists.controller";

@Module({
    imports: [TypeOrmModule.forFeature([CardList])],
    controllers: [CardListssController],
    providers: [CardListsService],
    exports: [CardListsService],
})
export class CardListsModule {}
