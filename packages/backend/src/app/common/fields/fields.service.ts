import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Field } from "./field.entity";
import { CreateFieldDto } from "./dto/create.field.dto";
import { UpdateFieldDto } from "./dto/update.field.dto";
import { ClsService } from "nestjs-cls";
import { AccessControlService } from "../auth/services/access.control.service";
import { PermissionLevel } from "@tillywork/shared";
import { CardType } from "../card-types/card.type.entity";
import { AclContext } from "../auth/context/acl.context";

export type FindAllParams = {
    workspaceId?: number;
    listId?: number;
    cardTypeId?: number;
    createdByType?: "system" | "user";
};

@Injectable()
export class FieldsService {
    constructor(
        @InjectRepository(Field)
        private fieldsRepository: Repository<Field>,
        private clsService: ClsService,
        private accessControlService: AccessControlService,
        private aclContext: AclContext
    ) {}

    async findAll({
        workspaceId,
        listId,
        cardTypeId,
        createdByType,
    }: FindAllParams): Promise<Field[]> {
        if (!workspaceId && !listId && !cardTypeId) {
            throw new BadRequestException(
                "[FieldsService#findAll] One of the following query params is required: workspaceId, listId, cardTypeId"
            );
        }

        const user = this.clsService.get("user");

        if (!this.aclContext.shouldSkipAcl()) {
            if (workspaceId) {
                await this.accessControlService.authorize(
                    user,
                    "workspace",
                    workspaceId,
                    PermissionLevel.VIEWER
                );
            } else if (listId) {
                await this.accessControlService.authorize(
                    user,
                    "list",
                    listId,
                    PermissionLevel.VIEWER
                );
            } else if (cardTypeId) {
                const cardType = await this.fieldsRepository.manager
                    .getRepository(CardType)
                    .findOneOrFail({
                        where: {
                            id: cardTypeId,
                        },
                        loadRelationIds: {
                            relations: ["workspace"],
                        },
                    });

                await this.accessControlService.authorize(
                    user,
                    "workspace",
                    cardType.workspace as unknown as number,
                    PermissionLevel.VIEWER
                );
            }
        }

        return this.fieldsRepository.find({
            where: {
                workspace: {
                    id: workspaceId,
                },
                lists: {
                    id: listId,
                },
                cardType: {
                    id: cardTypeId,
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
        const user = this.clsService.get("user");
        const field = await this.fieldsRepository.findOne({
            where: { id },
            loadRelationIds: {
                relations: ["workspace"],
            },
        });

        if (!field) {
            throw new NotFoundException(`Field with ID ${id} not found`);
        }

        await this.accessControlService.authorize(
            user,
            "workspace",
            field.workspace as unknown as number,
            PermissionLevel.VIEWER
        );

        return field;
    }

    async findOneBySlug({
        slug,
        workspaceId,
        cardTypeId,
    }: {
        slug: string;
        workspaceId: number;
        cardTypeId?: number;
    }) {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "workspace",
            workspaceId,
            PermissionLevel.VIEWER
        );

        return this.fieldsRepository.findOneBy({
            slug,
            workspace: {
                id: workspaceId,
            },
            cardType: {
                id: cardTypeId,
            },
        });
    }

    async create(createFieldDto: CreateFieldDto): Promise<Field> {
        const user = this.clsService.get("user");
        await this.accessControlService.authorize(
            user,
            "workspace",
            createFieldDto.workspaceId,
            PermissionLevel.EDITOR
        );

        const slugExistsInWorkspace = await this.findOneBySlug({
            slug: createFieldDto.slug,
            workspaceId: createFieldDto.workspaceId,
            cardTypeId: createFieldDto.cardTypeId,
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
            dataCardType: {
                id: createFieldDto.dataCardType?.id,
            },
        });

        return this.fieldsRepository.save(field);
    }

    async update(id: number, updateFieldDto: UpdateFieldDto): Promise<Field> {
        const user = this.clsService.get("user");
        const field = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "workspace",
            field.workspace as unknown as number,
            PermissionLevel.EDITOR
        );

        this.fieldsRepository.merge(field, updateFieldDto);

        return this.fieldsRepository.save(field);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");
        const field = await this.findOne(id);

        await this.accessControlService.authorize(
            user,
            "workspace",
            field.workspace as unknown as number,
            PermissionLevel.EDITOR
        );

        await this.fieldsRepository.softRemove(field);
    }
}
