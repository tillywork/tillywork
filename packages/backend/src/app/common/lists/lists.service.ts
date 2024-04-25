import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { CreateListDto } from "./dto/create.list.dto";
import { UpdateListDto } from "./dto/update.list.dto";
import { ListStagesService } from "./list.stages.service";

export type ListFindAllResult = {
    total: number;
    lists: List[];
};

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(List)
        private listsRepository: Repository<List>,
        private listStagesService: ListStagesService
    ) {}

    async findAll(): Promise<ListFindAllResult> {
        const result = await this.listsRepository.findAndCount({
            relations: ["listStages"],
        });
        return { lists: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<List> {
        const list = await this.listsRepository.findOne({
            where: {
                id,
            },
            relations: ["listStages", "views"],
        });
        if (!list) {
            throw new NotFoundException(`List with ID ${id} not found`);
        }
        return list;
    }

    async create(createListDto: CreateListDto): Promise<List> {
        const list = this.listsRepository.create(createListDto);
        await this.listsRepository.save(list);

        const defaultStages = [
            {
                name: "To Do",
                color: "rgb(79, 87, 98)",
            },
            {
                name: "In Progress",
                color: "#2196F3",
            },
            {
                name: "Done",
                color: "rgb(51, 211, 145)",
            },
        ];
        defaultStages.forEach((stage) => {
            this.listStagesService.create({
                name: stage.name,
                listId: list.id,
                color: stage.color,
            });
        });

        return list;
    }

    async update(id: number, updateListDto: UpdateListDto): Promise<List> {
        const list = await this.findOne(id);
        this.listsRepository.merge(list, updateListDto);
        return this.listsRepository.save(list);
    }

    async remove(id: number): Promise<void> {
        const list = await this.findOne(id);
        await this.listsRepository.remove(list);
    }
}
