import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { Prop } from "./prop.entity";
import { CreatePropDto } from "./dto/create.prop.dto";
import { UpdatePropDto } from "./dto/update.prop.dto";

export type PropFindAllResult = {
    total: number;
    props: Prop[];
};

@Injectable()
export class PropsService {
    constructor(
        @InjectRepository(Prop)
        private propsRepository: Repository<Prop>
    ) {}

    async findAll(options?: FindManyOptions): Promise<PropFindAllResult> {
        const result = await this.propsRepository.findAndCount(options);
        return { props: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<Prop> {
        const prop = await this.propsRepository.findOne({ where: { id } });
        if (!prop) {
            throw new NotFoundException(`Prop with ID ${id} not found`);
        }
        return prop;
    }

    async findOneBy({ where }: { where: object }): Promise<Prop> {
        return this.propsRepository.findOne({ where });
    }

    async create(createPropDto: CreatePropDto): Promise<Prop> {
        const prop = this.propsRepository.create(createPropDto);
        return this.propsRepository.save(prop);
    }

    async update(id: number, updatePropDto: UpdatePropDto): Promise<Prop> {
        const prop = await this.findOne(id);
        this.propsRepository.merge(prop, updatePropDto);
        return this.propsRepository.save(prop);
    }

    async remove(id: number): Promise<void> {
        const prop = await this.findOne(id);
        await this.propsRepository.remove(prop);
    }
}
