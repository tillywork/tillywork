import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Space } from "./space.entity";
import { CreateSpaceDto } from "./dto/create.space.dto";
import { UpdateSpaceDto } from "./dto/update.space.dto";
import { SpaceSideEffectsService } from "./space.side.effects.service";
import { CardType } from "../card-types/card.type.entity";
import { IsNotEmpty, IsNumber } from "class-validator";

export type SpaceFindAllResult = {
    total: number;
    spaces: Space[];
};

export class FindAllParams {
    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;
}

@Injectable()
export class SpacesService {
    constructor(
        @InjectRepository(Space)
        private spacesRepository: Repository<Space>,
        private spaceSideEffectsService: SpaceSideEffectsService
    ) {}

    async findAll({ workspaceId }: FindAllParams): Promise<Space[]> {
        const where: FindOptionsWhere<Space> = {
            workspace: {
                id: workspaceId,
            },
        };

        return this.spacesRepository.find({
            where,
            order: {
                createdAt: "ASC",
                lists: {
                    createdAt: "ASC",
                },
            },
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

        if (createSpaceDto.createOnboardingData) {
            const cardType = await this.spacesRepository.manager
                .getRepository(CardType)
                .findOne({
                    where: {
                        workspace: {
                            id: space.workspaceId,
                        },
                    },
                });
            const list = await this.spaceSideEffectsService.postCreate({
                space,
                defaultCardType: cardType,
            });
            space.lists = [list];
        }

        return space;
    }

    async update(id: number, updateSpaceDto: UpdateSpaceDto): Promise<Space> {
        const space = await this.findOne(id);
        this.spacesRepository.merge(space, updateSpaceDto);
        return this.spacesRepository.save(space);
    }

    async remove(id: number): Promise<void> {
        const space = await this.findOne(id);
        await this.spacesRepository.softRemove(space);
    }
}
