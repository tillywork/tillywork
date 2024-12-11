import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardType } from "./card.type.entity";
import { CardTypesController } from "./card.types.controller";
import { CardTypesService } from "./card.types.service";
import { ListsModule } from "../lists/lists.module";
import { CardsModule } from "../cards/cards.module";
import { FieldsModule } from "../fields/fields.module";
import { AuthModule } from "../auth/auth.module";
import { CardTypesSideEffectsService } from "./card.types.side.effects.service";
import { Workspace } from "../workspaces/workspace.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([CardType, Workspace]),
        ListsModule,
        CardsModule,
        FieldsModule,
        AuthModule,
    ],
    controllers: [CardTypesController],
    providers: [CardTypesService, CardTypesSideEffectsService],
    exports: [CardTypesService],
})
export class CardTypesModule {}
