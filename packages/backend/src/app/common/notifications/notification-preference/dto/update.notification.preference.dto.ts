import { NotificationChannel } from "@tillywork/shared";
import { IsBoolean, IsEnum, IsObject, IsOptional } from "class-validator";

export class UpdateNotificationPreferenceDto {
    @IsEnum(NotificationChannel)
    channel: NotificationChannel;

    @IsBoolean()
    enabled: boolean;

    @IsOptional()
    @IsObject()
    config?: Record<string, any>;
}
