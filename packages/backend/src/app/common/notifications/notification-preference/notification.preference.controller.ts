import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { NotificationPreferenceService } from "./notification.preference.service";
import { CurrentUser } from "../../auth/decorators/current.user.decorator";
import { User } from "../../users/user.entity";
import { UpdateNotificationPreferenceDto } from "./dto/update.notification.preference.dto";

@Controller("notification-preferences")
@UseGuards(JwtAuthGuard)
export class NotificationPreferenceController {
    constructor(private readonly service: NotificationPreferenceService) {}

    @Get()
    async getAll(@CurrentUser() user: User) {
        return this.service.findAllForUser(user.id);
    }

    @Put()
    async update(
        @CurrentUser() user: User,
        @Body() dto: UpdateNotificationPreferenceDto
    ) {
        return this.service.updateForUser(user.id, dto);
    }
}
