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

    @Get()
    findAll(
        @Param("projectId") projectId: number,
        @Param("userId") userId: number,
        @Query("workspaceId") workspaceId: number,
        @Query("deduplicate") deduplicate?: boolean,
        @Query("limit") limit?: number
    ) {
        return this.projectUserActivitiesService.findAll({
            projectId,
            userId,
            workspaceId,
            deduplicate,
            limit,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: number) {
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
