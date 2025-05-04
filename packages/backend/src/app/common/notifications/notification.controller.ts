import {
    UseGuards,
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    ParseUUIDPipe,
    Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CreateNotificationDto } from "./dto/create.notification.dto";
import { UpdateNotificationDto } from "./dto/update.notification.dto";
import { NotificationService } from "./notification.service";
import { CurrentUser } from "../auth/decorators/current.user.decorator";

@ApiBearerAuth()
@ApiTags("notifications")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "notifications",
    version: "1",
})
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post()
    async create(@Body() body: CreateNotificationDto) {
        return this.notificationService.create(body);
    }

    @Get()
    async findAll(
        @CurrentUser() user,
        @Query("workspaceId") workspaceId: number,
        @Query("isRead") isRead?: boolean
    ) {
        return this.notificationService.findAll({
            userId: user.id,
            isRead,
            workspaceId,
        });
    }

    @Put(":id")
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() body: UpdateNotificationDto
    ) {
        return this.notificationService.update(id, body);
    }

    @Put("mark-all-read")
    async markAllAsRead(@CurrentUser() user) {
        await this.notificationService.markAllAsRead(user.id);
        return { message: "Success" };
    }
}
