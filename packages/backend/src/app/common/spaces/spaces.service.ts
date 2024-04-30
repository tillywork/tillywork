import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Space } from "./space.entity";
import { CreateSpaceDto } from "./dto/create.space.dto";
import { UpdateSpaceDto } from "./dto/update.space.dto";
import { SpaceSideEffectsService } from "./space.side.effects.service";

export type SpaceFindAllResult = {
    total: number;
    spaces: Space[];
};

@Injectable()
export class SpacesService {
    constructor(
        @InjectRepository(Space)
        private spacesRepository: Repository<Space>,
        private spaceSideEffectsService: SpaceSideEffectsService
    ) {}

    async findAll(): Promise<SpaceFindAllResult> {
        const result = await this.spacesRepository.findAndCount();
        return { spaces: result[0], total: result[1] };
    }

    async findAllBy({ where }: { where: object }): Promise<Space[]> {
        return this.spacesRepository.find({
            where,
            order: { createdAt: "ASC" },
            relations: ["lists"],
        });
    }

    async findOne(id: number): Promise<Space> {
        const space = await this.spacesRepository.findOne({ where: { id } });
        if (!space) {
            throw new NotFoundException(`Space with ID ${id} not found`);
        }
        return space;
    }

    async create(createSpaceDto: CreateSpaceDto): Promise<Space> {
        const space = this.spacesRepository.create(createSpaceDto);
        await this.spacesRepository.save(space);

        const postCreate = await this.spaceSideEffectsService.postCreate(space);

        return space;
    }

    async update(id: number, updateSpaceDto: UpdateSpaceDto): Promise<Space> {
        const space = await this.findOne(id);
        this.spacesRepository.merge(space, updateSpaceDto);
        return this.spacesRepository.save(space);
    }

    async remove(id: number): Promise<void> {
        const space = await this.findOne(id);
        await this.spacesRepository.remove(space);
    }
}
