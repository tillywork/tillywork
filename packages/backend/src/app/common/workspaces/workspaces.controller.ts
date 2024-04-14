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
} from "@nestjs/common";
import { WorkspaceFindAllResult, WorkspacesService } from "./workspaces.service";
import { Workspace } from "./workspace.entity";
import { CreateWorkspaceDto } from "./dto/create.workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update.workspace.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { WorkspaceTypes } from "./types";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "workspaces",
    version: "1",
})
export class WorkspacesController {
    private readonly logger = new Logger(WorkspacesController.name);
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    findAll(@Request() req, @Query() query: {
        workspaceType?: WorkspaceTypes;
    }): Promise<WorkspaceFindAllResult> {
        const { user } = req;
        const { workspaceType } = query;

        const where = {
            ownerId: user.id,
        }

        if (workspaceType) {
            where['workspaceType'] = workspaceType;
        }

        this.logger.debug({ where })

        return this.workspacesService.findAll({
            where
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Workspace> {
        return this.workspacesService.findOne(+id);
    }

    @Post()
    create(
        @Body() createWorkspaceDto: CreateWorkspaceDto,
        @Request() req
    ): Promise<Workspace> {
        return this.workspacesService.create({
            ...createWorkspaceDto,
            ownerId: req.user.id,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateWorkspaceDto
    ): Promise<Workspace> {
        return this.workspacesService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.workspacesService.remove(+id);
    }
}
