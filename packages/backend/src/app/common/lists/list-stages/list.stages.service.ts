import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListStage } from "./list.stage.entity";
import { CreateListStageDto } from "./dto/create.list.stage.dto";
import { UpdateListStageDto } from "./dto/update.list.stage.dto";

export type ListStageFindAllResult = {
    total: number;
    lists: ListStage[];
};

export type FindAllParams = {
    listId: number;
};

@Injectable()
export class ListStagesService {
    constructor(
        @InjectRepository(ListStage)
        private listStagesRepository: Repository<ListStage>
    ) {}

    async findAll({ listId }: FindAllParams): Promise<ListStage[]> {
        const where = {
            listId,
        };

        return this.listStagesRepository.find({
            where,
            order: {
                order: "ASC",
            },
        });
    }

    async findOne(id: number): Promise<ListStage> {
        const listStage = await this.listStagesRepository.findOne({
            where: {
                id,
            },
        });
        if (!listStage) {
            throw new NotFoundException(`ListStage with ID ${id} not found`);
        }
        return listStage;
    }

    async create(createListStageDto: CreateListStageDto): Promise<ListStage> {
        const listStage = this.listStagesRepository.create(createListStageDto);
        await this.listStagesRepository.save(listStage);

        return listStage;
    }

    async update(
        id: number,
        updateListStageDto: UpdateListStageDto
    ): Promise<ListStage> {
        const listStage = await this.findOne(id);
        this.listStagesRepository.merge(listStage, updateListStageDto);
        return this.listStagesRepository.save(listStage);
    }

    async remove(id: number): Promise<void> {
        const listStage = await this.findOne(id);
        await this.listStagesRepository.remove(listStage);
    }
}
