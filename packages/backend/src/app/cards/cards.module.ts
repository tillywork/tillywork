import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card } from './card.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
    ],
    controllers: [CardsController],
    providers: [
        CardsService,
    ],
    exports: [CardsService],
})
export class CardsModule { }
