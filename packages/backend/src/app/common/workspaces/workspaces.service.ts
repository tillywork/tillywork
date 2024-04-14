import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { CreateWorkspaceDto } from './dto/create.workspace.dto';
import { UpdateWorkspaceDto } from './dto/update.workspace.dto';

export type WorkspaceFindAllResult = {
    total: number;
    workspaces: Workspace[];
};

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private workspacesRepository: Repository<Workspace>
    ) { }

    async findAll(options?: FindManyOptions): Promise<WorkspaceFindAllResult> {
        const result = await this.workspacesRepository.findAndCount(options);
        return { workspaces: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<Workspace> {
        const workspace = await this.workspacesRepository.findOne({ where: { id } });
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
        return this.workspacesRepository.save(workspace);
    }

    async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
        const workspace = await this.findOne(id);
        this.workspacesRepository.merge(workspace, updateWorkspaceDto);
        return this.workspacesRepository.save(workspace);
    }

    async remove(id: number): Promise<void> {
        const workspace = await this.findOne(id);
        await this.workspacesRepository.remove(workspace);
    }
}
