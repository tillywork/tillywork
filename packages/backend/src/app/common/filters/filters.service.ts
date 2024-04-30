import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { Filter } from "./filter.entity";
import { CreateFilterDto } from "./dto/create.filter.dto";
import { UpdateFilterDto } from "./dto/update.filter.dto";

export type FilterFindAllResult = {
    total: number;
    filters: Filter[];
};

@Injectable()
export class FiltersService {
    constructor(
        @InjectRepository(Filter)
        private filtersRepository: Repository<Filter>
    ) {}

    async findAll(options?: FindManyOptions): Promise<FilterFindAllResult> {
        const result = await this.filtersRepository.findAndCount(options);
        return { filters: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<Filter> {
        const filter = await this.filtersRepository.findOne({ where: { id } });
        if (!filter) {
            throw new NotFoundException(`Filter with ID ${id} not found`);
        }
        return filter;
    }

    async findOneBy({ where }: { where: object }): Promise<Filter> {
        return this.filtersRepository.findOne({ where });
    }

    async create(createFilterDto: CreateFilterDto): Promise<Filter> {
        const filter = this.filtersRepository.create(createFilterDto);
        return this.filtersRepository.save(filter);
    }

    async update(
        id: number,
        updateFilterDto: UpdateFilterDto
    ): Promise<Filter> {
        const filter = await this.findOne(id);
        this.filtersRepository.merge(filter, updateFilterDto);
        return this.filtersRepository.save(filter);
    }

    async remove(id: number): Promise<void> {
        const filter = await this.findOne(id);
        await this.filtersRepository.remove(filter);
    }
}
