import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ListStage } from "./list.stage.entity";
import { CreateListStageDto } from "./dto/create.list.stage.dto";
import { UpdateListStageDto } from "./dto/update.list.stage.dto";
import { CardListsService } from "../../cards/card-lists/card.lists.service";

export type ListStageFindAllResult = {
    total: number;
    lists: ListStage[];
};

export type FindAllParams = {
    listId: number;
    hideCompleted?: boolean;
};

@Injectable()
export class ListStagesService {
    constructor(
        @InjectRepository(ListStage)
        private listStagesRepository: Repository<ListStage>,
        private cardListsService: CardListsService
    ) {}

    async findAll({
        listId,
        hideCompleted,
    }: FindAllParams): Promise<ListStage[]> {
        const where: FindOptionsWhere<ListStage> = {
            listId,
        };

        if (hideCompleted) {
            where.isCompleted = false;
        }

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

    async findBy({
        where,
    }: {
        where: FindOptionsWhere<ListStage>;
    }): Promise<ListStage[]> {
        return this.listStagesRepository.find({ where });
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

    async reorder(
        listStages: Pick<ListStage, "id" | "order">[]
    ): Promise<ListStage[]> {
        const listStagesToUpdated = await Promise.all(
            listStages.map(async ({ id, order }) => {
                const listStage = await this.findOne(id);
                this.listStagesRepository.merge(listStage, { order });
                return listStage;
            })
        );
        return this.listStagesRepository.save(listStagesToUpdated);
    }

    async remove(id: number, replacementListStage: ListStage): Promise<void> {
        const listStage = await this.findOne(id);

        // Update cards that have this list stage
        await this.cardListsService.batchUpdate(
            {
                listStage,
            },
            {
                listStage: replacementListStage,
            }
        );

        await this.listStagesRepository.remove(listStage);
    }
}
