import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropsController } from './props.controller';
import { PropsService } from './props.service';
import { Prop } from './prop.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Prop]),
    ],
    controllers: [PropsController],
    providers: [
        PropsService,
    ],
    exports: [PropsService],
})
export class PropsModule { }
