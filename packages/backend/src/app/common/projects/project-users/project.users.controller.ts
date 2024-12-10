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
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { CreateProjectUserDto } from "./dto/create.project.user.dto";
import { UpdateProjectUserDto } from "./dto/update.project.user.dto";
import { ProjectUser } from "./project.user.entity";
import { ProjectUsersService } from "./project.users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("projects")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "projects/:projectId/users",
    version: "1",
})
export class ProjectUsersController {
    constructor(private readonly projectUsersService: ProjectUsersService) {}

    @Get()
    findAll(@Param("projectId") projectId: number): Promise<ProjectUser[]> {
        return this.projectUsersService.findAll({
            projectId,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<ProjectUser> {
        return this.projectUsersService.findOne(+id);
    }

    @Post()
    create(
        @Body() createProjectUserDto: CreateProjectUserDto
    ): Promise<ProjectUser> {
        return this.projectUsersService.create(createProjectUserDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateProjectUserDto: UpdateProjectUserDto
    ): Promise<ProjectUser> {
        return this.projectUsersService.update(+id, updateProjectUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.projectUsersService.remove(+id);
    }
}
