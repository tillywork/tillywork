import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Watcher } from "./watcher.entity";
import { WatcherService } from "./watcher.service";
import { WatcherController } from "./watcher.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Watcher])],
    controllers: [WatcherController],
    providers: [WatcherService],
    exports: [WatcherService],
})
export class WatcherModule {}
