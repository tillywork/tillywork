import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { Project } from "./project.entity";
import { CreateProjectDto } from "./dto/create.project.dto";
import { UpdateProjectDto } from "./dto/update.project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../auth/services/auth.service";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";

@ApiTags("projects")
@Controller({
    path: "projects",
    version: "1",
})
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly authService: AuthService
    ) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@CurrentUser() user: User): Promise<Project[]> {
        return this.projectsService.findAll({
            users: {
                user,
            },
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<Project> {
        const project = await this.projectsService.findOne(+id);

        return project;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Body() createProjectDto: CreateProjectDto,
        @CurrentUser() user: User
    ): Promise<Project> {
        return this.projectsService.create({
            ...createProjectDto,
            ownerId: user.id,
            users: [
                {
                    user,
                    role: "owner",
                    project: createProjectDto as Project,
                },
            ],
        });
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateProjectDto: UpdateProjectDto
    ): Promise<Project> {
        return this.projectsService.update(+id, updateProjectDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.projectsService.remove(+id);
    }

    @Get("/invite/:inviteCode")
    findOneByInviteCode(@Param("inviteCode") inviteCode: string) {
        return this.projectsService.findOneByInviteCode(inviteCode);
    }
}
