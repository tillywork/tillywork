import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardType } from "./card.type.entity";
import { CardTypesController } from "./card.types.controller";
import { CardTypesService } from "./card.types.service";

@Module({
    imports: [TypeOrmModule.forFeature([CardType])],
    controllers: [CardTypesController],
    providers: [CardTypesService],
    exports: [CardTypesService],
})
export class CardTypesModule {}
