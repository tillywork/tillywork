import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationPreference } from "./notification.preference.entity";
import { NotificationPreferenceService } from "./notification.preference.service";
import { NotificationPreferenceController } from "./notification.preference.controller";

@Module({
    imports: [TypeOrmModule.forFeature([NotificationPreference])],
    providers: [NotificationPreferenceService],
    controllers: [NotificationPreferenceController],
    exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
