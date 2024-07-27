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
    Logger,
    Query,
    Res,
} from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { Workspace } from "./workspace.entity";
import { CreateWorkspaceDto } from "./dto/create.workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update.workspace.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { WorkspaceTypes } from "./types";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("workspaces")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "workspaces",
    version: "1",
})
export class WorkspacesController {
    private readonly logger = new Logger(WorkspacesController.name);
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    findAll(
        @Request() req,
        @Query()
        query: {
            type?: WorkspaceTypes;
        }
    ): Promise<Workspace[]> {
        const { user } = req;
        const { type } = query;

        return this.workspacesService.findAll({
            projectId: user.project.id,
            type,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Workspace> {
        return this.workspacesService.findOne(+id);
    }

    @Post()
    async create(
        @Body() createWorkspaceDto: CreateWorkspaceDto,
        @Request() req,
        @Res({ passthrough: true }) res
    ): Promise<Workspace | { error: string }> {
        const response = await this.workspacesService.create({
            ...createWorkspaceDto,
            ownerId: req.user.id,
        });

        if (response["error"]) {
            res.status(422);
        }

        return response;
    }

    @Put(":id")
    async update(
        @Param("id") id: string,
        @Body() updateWorkspaceDto: UpdateWorkspaceDto,
        @Res({ passthrough: true }) res
    ): Promise<Workspace | { error: string }> {
        const response = this.workspacesService.update(+id, updateWorkspaceDto);

        if (response["error"]) {
            res.status(422);
        }

        return response;
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.workspacesService.remove(+id);
    }
}
