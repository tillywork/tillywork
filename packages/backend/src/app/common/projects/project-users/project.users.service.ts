import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { ProjectUser } from "./project.user.entity";
import { CreateProjectUserDto } from "./dto/create.project.user.dto";
import { UpdateProjectUserDto } from "./dto/update.project.user.dto";

export type ProjectUserFindAllResult = {
    total: number;
    projects: ProjectUser[];
};

@Injectable()
export class ProjectUsersService {
    constructor(
        @InjectRepository(ProjectUser)
        private projectUsersRepository: Repository<ProjectUser>
    ) {}

    async findAll(
        options?: FindManyOptions<ProjectUser>
    ): Promise<ProjectUser[]> {
        return this.projectUsersRepository.find(options);
    }

    async findOne(id: number): Promise<ProjectUser> {
        const projectUser = await this.projectUsersRepository.findOne({
            where: { id },
        });
        if (!projectUser) {
            throw new NotFoundException(`ProjectUser with ID ${id} not found`);
        }
        return projectUser;
    }

    async findOneBy({ where }: { where: object }): Promise<ProjectUser> {
        return this.projectUsersRepository.findOne({ where });
    }

    async create(
        createProjectUserDto: CreateProjectUserDto
    ): Promise<ProjectUser> {
        const projectUser =
            this.projectUsersRepository.create(createProjectUserDto);
        await this.projectUsersRepository.save(projectUser);

        return projectUser;
    }

    async update(
        id: number,
        updateProjectUserDto: UpdateProjectUserDto
    ): Promise<ProjectUser> {
        const projectUser = await this.findOne(id);
        this.projectUsersRepository.merge(projectUser, updateProjectUserDto);
        return this.projectUsersRepository.save(projectUser);
    }

    async remove(id: number): Promise<void> {
        const projectUser = await this.findOne(id);
        await this.projectUsersRepository.remove(projectUser);
    }
}
