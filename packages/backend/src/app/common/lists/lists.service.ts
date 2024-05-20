import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { CreateListDto } from "./dto/create.list.dto";
import { UpdateListDto } from "./dto/update.list.dto";
import { ListSideEffectsService } from "./list.side.effects.service";

export type ListFindAllResult = {
    total: number;
    lists: List[];
};

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(List)
        private listsRepository: Repository<List>,
        private listSideEffectsService: ListSideEffectsService
    ) {}

    async findAll(): Promise<ListFindAllResult> {
        const [lists, total] = await this.listsRepository.findAndCount({
            relations: [
                "listStages",
                "space",
                "space.workspace",
                "space.workspace.project",
                "space.workspace.project.users",
            ],
        });

        return { lists, total };
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

        await this.listSideEffectsService.postCreate(list);

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
