import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { WatcherModule } from "../watchers/watcher.module";
import { NotificationHandler } from "./notification.handler";
import { CardsModule } from "../cards/cards.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { ListStagesModule } from "../lists/list-stages/list.stages.module";
import { BullModule } from "@nestjs/bull";
import { NotificationProcessor } from "./notification.processor";
import { NotificationsGateway } from "./notification.gateway";
import { NotificationPreferenceModule } from "./notification-preference/notification.preference.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        BullModule.registerQueue({
            name: "notifications",
        }),
        forwardRef(() => WatcherModule),
        forwardRef(() => CardsModule),
        forwardRef(() => AuthModule),
        forwardRef(() => UsersModule),
        forwardRef(() => ListStagesModule),
        NotificationPreferenceModule,
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationHandler,
        NotificationProcessor,
        NotificationsGateway,
    ],
    exports: [NotificationService],
})
export class NotificationModule {}
