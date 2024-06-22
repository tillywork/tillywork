import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Field } from "./field.entity";
import { CreateFieldDto } from "./dto/create.field.dto";
import { UpdateFieldDto } from "./dto/update.field.dto";

export type FindAllParams = {
    workspaceId: number;
};

@Injectable()
export class FieldsService {
    constructor(
        @InjectRepository(Field)
        private fieldsRepository: Repository<Field>
    ) {}

    async findAll({ workspaceId }: FindAllParams): Promise<Field[]> {
        return this.fieldsRepository.find({
            where: {
                workspace: {
                    id: workspaceId,
                },
            },
        });
    }

    async findOne(id: number): Promise<Field> {
        const field = await this.fieldsRepository.findOne({ where: { id } });
        if (!field) {
            throw new NotFoundException(`Field with ID ${id} not found`);
        }
        return field;
    }

    async findOneBy({ where }: { where: object }): Promise<Field> {
        return this.fieldsRepository.findOne({ where });
    }

    async create(createFieldDto: CreateFieldDto): Promise<Field> {
        const field = this.fieldsRepository.create({
            ...createFieldDto,
            workspace: {
                id: createFieldDto.workspaceId,
            },
        });

        return this.fieldsRepository.save(field);
    }

    async update(id: number, updateFieldDto: UpdateFieldDto): Promise<Field> {
        const field = await this.findOne(id);

        Logger.debug({ updateFieldDto });
        this.fieldsRepository.merge(field, updateFieldDto);

        return this.fieldsRepository.save(field);
    }

    async remove(id: number): Promise<void> {
        const field = await this.findOne(id);
        await this.fieldsRepository.softRemove(field);
    }
}
