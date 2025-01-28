import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ViewsController } from "./views.controller";
import { ViewsService } from "./views.service";
import { View } from "./view.entity";
import { ViewSubscriber } from "./view.subscriber";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([View]), AuthModule],
    controllers: [ViewsController],
    providers: [ViewsService, ViewSubscriber],
    exports: [ViewsService],
})
export class ViewsModule {}
