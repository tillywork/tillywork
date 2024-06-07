import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViewsController } from "./views.controller";
import { ViewsService } from "./views.service";
import { View } from "./view.entity";
import { ViewSubscriber } from "./view.subscriber";

@Module({
    imports: [TypeOrmModule.forFeature([View])],
    controllers: [ViewsController],
    providers: [ViewsService, ViewSubscriber],
    exports: [ViewsService],
})
export class ViewsModule {}
