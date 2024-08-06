import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Workspace } from "./workspace.entity";
import { CreateWorkspaceDto } from "./dto/create.workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update.workspace.dto";
import { WorkspaceSideEffectsService } from "./workspace.side.effects.service";
import { WorkspaceTypes } from "./types";

export type WorkspaceFindAllResult = {
    total: number;
    workspaces: Workspace[];
};

export type FindAllParams = {
    projectId: number;
    type?: WorkspaceTypes;
};

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private workspacesRepository: Repository<Workspace>,
        private workspaceSideEffectsService: WorkspaceSideEffectsService
    ) {}

    async findAll({ projectId, type }: FindAllParams): Promise<Workspace[]> {
        return this.workspacesRepository.find({
            where: {
                project: {
                    id: projectId,
                },
                type,
            },
            order: {
                createdAt: "ASC",
            },
        });
    }

    async findOne(id: number): Promise<Workspace> {
        const workspace = await this.workspacesRepository.findOne({
            where: { id },
        });
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return workspace;
    }

    async findOneBy({ where }: { where: object }): Promise<Workspace> {
        return this.workspacesRepository.findOne({ where });
    }

    async findOneBySlug(slug: string): Promise<Workspace> {
        return this.workspacesRepository.findOne({ where: { slug } });
    }

    async create(
        createWorkspaceDto: CreateWorkspaceDto
    ): Promise<Workspace | { error: string }> {
        const workspaceBySlug = await this.findOneBySlug(
            createWorkspaceDto.slug
        );

        if (workspaceBySlug) {
            return {
                error: "SLUG_EXISTS",
            };
        }

        const workspace = this.workspacesRepository.create(createWorkspaceDto);
        await this.workspacesRepository.save(workspace);

        const defaultCardTypes =
            await this.workspaceSideEffectsService.createDefaultCardTypes(
                workspace
            );

        workspace.defaultCardType = defaultCardTypes[0];
        await this.workspacesRepository.save(workspace);

        if (createWorkspaceDto.createOnboardingData) {
            const space = await this.workspaceSideEffectsService.postCreate(
                workspace
            );
            workspace.spaces = [space];
        }

        return workspace;
    }

    async update(
        id: number,
        updateWorkspaceDto: UpdateWorkspaceDto
    ): Promise<Workspace | { error: string }> {
        const workspaceBySlug = await this.findOneBySlug(
            updateWorkspaceDto.slug
        );

        if (workspaceBySlug && workspaceBySlug.id !== id) {
            return {
                error: "SLUG_EXISTS",
            };
        }

        const workspace = await this.findOne(id);
        this.workspacesRepository.merge(workspace, updateWorkspaceDto);
        return this.workspacesRepository.save(workspace);
    }

    async remove(id: number): Promise<void> {
        const workspace = await this.findOne(id);
        await this.workspacesRepository.softRemove(workspace);
    }
}
