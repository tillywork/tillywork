import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { Space } from './space.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Space]),
    ],
    controllers: [SpacesController],
    providers: [
        SpacesService,
    ],
    exports: [SpacesService],
})
export class SpacesModule { }
