import { NotificationChannel } from "@tillywork/shared";
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
} from "class-validator";

export class UpsertNotificationPreferenceDto {
    @IsNotEmpty()
    @IsEnum(NotificationChannel)
    channel: NotificationChannel;

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

    @IsOptional()
    @IsObject()
    config?: Record<string, any>;
}
