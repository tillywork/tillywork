import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Field } from "./field.entity";
import { CreateFieldDto } from "./dto/create.field.dto";
import { UpdateFieldDto } from "./dto/update.field.dto";

export type FindAllParams = {
    workspaceId?: number;
    listId?: number;
    createdByType?: "system" | "user";
};

@Injectable()
export class FieldsService {
    constructor(
        @InjectRepository(Field)
        private fieldsRepository: Repository<Field>
    ) {}

    async findAll({
        workspaceId,
        listId,
        createdByType,
    }: FindAllParams): Promise<Field[]> {
        if (!workspaceId && !listId) {
            throw new BadRequestException(
                "[FieldsService#findAll] One of the following query params is required: workspaceId, listId"
            );
        }

        return this.fieldsRepository.find({
            where: {
                workspace: {
                    id: workspaceId,
                },
                lists: {
                    id: listId,
                },
                createdByType,
            },
            relations: ["lists"],
            order: {
                createdAt: "asc",
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

    async findOneBy(where: FindOptionsWhere<Field>): Promise<Field> {
        return this.fieldsRepository.findOne({ where });
    }

    async findOneBySlug({
        slug,
        workspaceId,
    }: {
        slug: string;
        workspaceId: number;
    }) {
        return this.findOneBy({
            slug,
            workspace: {
                id: workspaceId,
            },
        });
    }

    async create(createFieldDto: CreateFieldDto): Promise<Field> {
        const slugExistsInWorkspace = await this.findOneBySlug({
            slug: createFieldDto.slug,
            workspaceId: createFieldDto.workspaceId,
        });

        if (slugExistsInWorkspace) {
            throw new ConflictException(
                `This slug is already used in this workspace.`
            );
        }

        const field = this.fieldsRepository.create({
            ...createFieldDto,
            cardType: {
                id: createFieldDto.cardTypeId,
            },
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
