import {
    Controller,
    Post,
    Delete,
    Get,
    Body,
    Query,
    UseGuards,
} from "@nestjs/common";
import { WatcherService } from "./watcher.service";
import { CreateWatcherDto } from "./dto/create.watcher.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";
import { WatchableResourceType } from "@tillywork/shared";

@ApiBearerAuth()
@ApiTags("watchers")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "watchers",
    version: "1",
})
export class WatcherController {
    constructor(private readonly watcherService: WatcherService) {}

    @Post()
    async addWatcher(
        @Body() createWatcherDto: CreateWatcherDto,
        @CurrentUser() user: User
    ) {
        createWatcherDto.userId = user.id;
        return this.watcherService.addWatcher(createWatcherDto);
    }

    @Delete()
    async removeWatcher(
        @Body()
        body: {
            resourceType: WatchableResourceType;
            resourceId: number;
        },
        @CurrentUser() user: User
    ) {
        const { resourceType, resourceId } = body;
        const success = await this.watcherService.removeWatcher({
            userId: user.id,
            resourceType,
            resourceId,
        });
        return { success };
    }

    @Get()
    async getWatchers(
        @Query("resourceType") resourceType: WatchableResourceType,
        @Query("resourceId") resourceId: number
    ) {
        return this.watcherService.findWatchers({ resourceType, resourceId });
    }

    @Get("is-watching")
    async isWatching(
        @Query("resourceType") resourceType: WatchableResourceType,
        @Query("resourceId") resourceId: number,
        @CurrentUser() user: User
    ) {
        const watching = await this.watcherService.isWatching({
            userId: user.id,
            resourceType,
            resourceId,
        });

        return { watching };
    }
}
