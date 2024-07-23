import {
    Body,
    Controller,
    Get,
    UseGuards,
    Param,
    Post,
    Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { CreateProjectUserActivityDto } from "./dto/create.project.user.activity.dto";
import { ProjectUserActivitiesService } from "./project.user.activities.service";

@ApiBearerAuth()
@ApiTags("projects")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "projects/:projectId/users/:userId/activities",
    version: "1",
})
export class ProjectUserActivitiesController {
    constructor(
        private readonly projectUserActivitiesService: ProjectUserActivitiesService
    ) {}

    @Get("recent")
    findRecent(
        @Param("projectId") projectId: number,
        @Param("userId") userId: number,
        @Query("workspaceId") workspaceId: number,
        @Query("limit") limit?: number
    ) {
        return this.projectUserActivitiesService.findRecent({
            projectId,
            userId,
            workspaceId,
            limit,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.projectUserActivitiesService.findOne(id);
    }

    @Post()
    create(
        @Param("projectId") projectId: number,
        @Param("userId") userId: number,
        @Body() rest: Omit<CreateProjectUserActivityDto, "projectId" | "userId">
    ) {
        return this.projectUserActivitiesService.create({
            projectId,
            userId,
            ...rest,
        });
    }
}
