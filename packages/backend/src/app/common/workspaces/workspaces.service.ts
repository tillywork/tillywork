import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Not, Repository } from "typeorm";
import { Workspace } from "./workspace.entity";
import { CreateWorkspaceDto } from "./dto/create.workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update.workspace.dto";
import { WorkspaceSideEffectsService } from "./workspace.side.effects.service";
import { WorkspaceTypes } from "./types";
import { ClsService } from "nestjs-cls";
import { AccessControl } from "../auth/entities/access.control.entity";
import { AccessControlService } from "../auth/services/access.control.service";
import { PermissionLevel } from "@tillywork/shared";

export type WorkspaceFindAllResult = {
    total: number;
    workspaces: Workspace[];
};

export type FindAllParams = {
    type?: WorkspaceTypes;
};

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private workspacesRepository: Repository<Workspace>,
        private workspaceSideEffectsService: WorkspaceSideEffectsService,
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService,
        private clsService: ClsService
    ) {}

    async findAll({ type }: FindAllParams): Promise<Workspace[]> {
        const user = this.clsService.get("user");

        const accessControlEntries = await this.workspacesRepository.manager
            .getRepository(AccessControl)
            .find({
                where: {
                    user: {
                        id: user.id,
                    },
                    workspace: {
                        id: Not(IsNull()),
                    },
                    permissionLevel: Not(PermissionLevel.NONE),
                },
                loadRelationIds: {
                    relations: ["workspace"],
                },
            });

        const workspaceIds = accessControlEntries.map(
            (entry) => entry.workspace
        );
        const workspaces = await this.workspacesRepository.find({
            where: {
                id: In(workspaceIds),
                projectId: user.project.id,
                type,
            },
        });

        return workspaces;
    }

    async findOne(id: number): Promise<Workspace> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "workspace",
            id,
            PermissionLevel.VIEWER
        );

        const workspace = await this.workspacesRepository.findOne({
            where: { id },
        });

        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }

        return workspace;
    }

    async findOneBy({ where }: { where: object }): Promise<Workspace> {
        const workspace = await this.workspacesRepository.findOne({ where });
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "workspace",
            workspace.id,
            PermissionLevel.VIEWER
        );

        return workspace;
    }

    async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
        let workspace = this.workspacesRepository.create(createWorkspaceDto);
        await this.workspacesRepository.save(workspace);

        await this.accessControlService.applyResourceAccess(
            workspace,
            "workspace"
        );

        workspace = await this.workspaceSideEffectsService.postCreate({
            workspace,
        });
        await this.workspacesRepository.save(workspace);

        return workspace;
    }

    async update(
        id: number,
        updateWorkspaceDto: UpdateWorkspaceDto
    ): Promise<Workspace> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "workspace",
            id,
            PermissionLevel.EDITOR
        );

        const workspace = await this.findOne(id);

        this.workspacesRepository.merge(workspace, updateWorkspaceDto);
        return this.workspacesRepository.save(workspace);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "workspace",
            id,
            PermissionLevel.EDITOR
        );

        const workspace = await this.findOne(id);

        await this.workspacesRepository.softRemove(workspace);
    }
}
