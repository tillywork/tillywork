import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardType } from "./card.type.entity";
import { CardTypesController } from "./card.types.controller";
import { CardTypesService } from "./card.types.service";
import { ListsModule } from "../lists/lists.module";
import { CardsModule } from "../cards/cards.module";
import { FieldsModule } from "../fields/fields.module";
import { CardTypeSubscriber } from "./card.type.subscriber";

@Module({
    imports: [
        TypeOrmModule.forFeature([CardType]),
        ListsModule,
        CardsModule,
        FieldsModule,
    ],
    controllers: [CardTypesController],
    providers: [CardTypesService, CardTypeSubscriber],
    exports: [CardTypesService],
})
export class CardTypesModule {}
