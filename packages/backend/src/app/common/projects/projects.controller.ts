import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Request,
} from "@nestjs/common";
import { ProjectFindAllResult, ProjectsService } from "./projects.service";
import { Project } from "./project.entity";
import { CreateProjectDto } from "./dto/create.project.dto";
import { UpdateProjectDto } from "./dto/update.project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "projects",
    version: "1",
})
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    findAll(@Request() req): Promise<ProjectFindAllResult> {
        const { user } = req;
        return this.projectsService.findAll({
            where: {
                ownerId: user.id,
            }
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Project> {
        return this.projectsService.findOne(+id);
    }

    @Post()
    create(
        @Body() createProjectDto: CreateProjectDto,
        @Request() req
    ): Promise<Project> {
        return this.projectsService.create({
            ...createProjectDto,
            ownerId: req.user.id,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateProjectDto
    ): Promise<Project> {
        return this.projectsService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.projectsService.remove(+id);
    }
}
