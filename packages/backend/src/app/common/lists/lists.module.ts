import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { List } from './list.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([List]),
    ],
    controllers: [ListsController],
    providers: [
        ListsService,
    ],
    exports: [ListsService],
})
export class ListsModule { }
