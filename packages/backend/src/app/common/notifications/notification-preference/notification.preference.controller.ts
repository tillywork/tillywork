import { Controller, Get, Body, UseGuards, Param, Post } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { NotificationPreferenceService } from "./notification.preference.service";
import { CurrentUser } from "../../auth/decorators/current.user.decorator";
import { User } from "../../users/user.entity";
import { UpsertNotificationPreferenceDto } from "./dto/upsert.notification.preference.dto";
import { NotificationChannel } from "@tillywork/shared";

@Controller({
    path: "notification-preferences",
    version: "1",
})
@UseGuards(JwtAuthGuard)
export class NotificationPreferenceController {
    constructor(private readonly service: NotificationPreferenceService) {}

    @Get()
    async getAll(@CurrentUser() user: User) {
        return this.service.findAll(user.id);
    }

    @Get(":channel")
    async getOne(
        @CurrentUser() user: User,
        @Param("channel") channel: NotificationChannel
    ) {
        return this.service.findOne({
            userId: user.id,
            channel,
        });
    }

    @Post()
    async update(
        @CurrentUser() user: User,
        @Body() dto: UpsertNotificationPreferenceDto
    ) {
        return this.service.upsert(user.id, dto);
    }
}
