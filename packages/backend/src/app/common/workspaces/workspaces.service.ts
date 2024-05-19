import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { Workspace } from "./workspace.entity";
import { CreateWorkspaceDto } from "./dto/create.workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update.workspace.dto";
import { WorkspaceSideEffectsService } from "./workspace.side.effects.service";

export type WorkspaceFindAllResult = {
    total: number;
    workspaces: Workspace[];
};

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private workspacesRepository: Repository<Workspace>,
        private workspaceSideEffectsService: WorkspaceSideEffectsService
    ) {}

    async findAll(options?: FindManyOptions): Promise<Workspace[]> {
        return this.workspacesRepository.find(options);
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

    async create(createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
        const workspace = this.workspacesRepository.create(createWorkspaceDto);
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
    ): Promise<Workspace> {
        const workspace = await this.findOne(id);
        this.workspacesRepository.merge(workspace, updateWorkspaceDto);
        return this.workspacesRepository.save(workspace);
    }

    async remove(id: number): Promise<void> {
        const workspace = await this.findOne(id);
        await this.workspacesRepository.softRemove(workspace);
    }
}
