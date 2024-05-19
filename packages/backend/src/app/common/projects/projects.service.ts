import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { Project } from "./project.entity";
import { CreateProjectDto } from "./dto/create.project.dto";
import { UpdateProjectDto } from "./dto/update.project.dto";

export type ProjectFindAllResult = {
    total: number;
    projects: Project[];
};

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>
    ) {}

    async findAll(options?: FindManyOptions): Promise<Project[]> {
        return this.projectsRepository.find(options);
    }

    async findOne(id: number): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id },
        });
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    async findOneBy({ where }: { where: object }): Promise<Project> {
        return this.projectsRepository.findOne({ where });
    }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const project = this.projectsRepository.create(createProjectDto);
        return this.projectsRepository.save(project);
    }

    async update(
        id: number,
        updateProjectDto: UpdateProjectDto
    ): Promise<Project> {
        const project = await this.findOne(id);
        this.projectsRepository.merge(project, updateProjectDto);
        return this.projectsRepository.save(project);
    }

    async remove(id: number): Promise<void> {
        const project = await this.findOne(id);
        await this.projectsRepository.remove(project);
    }
}
