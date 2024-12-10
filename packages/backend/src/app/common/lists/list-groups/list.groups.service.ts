import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListGroup } from "./list.group.entity";
import { ListStagesService } from "../list-stages/list.stages.service";
import { CreateListGroupDto } from "./dto/create.list.group.dto";
import { UpdateListGroupDto } from "./dto/update.list.group.dto";
import { FieldsService } from "../../fields/fields.service";
import { ListsService } from "../lists.service";
import { FieldTypes } from "../../fields/types";
import { ListGroupEntityTypes } from "../types";
import { Field } from "../../fields/field.entity";
import { isEqual } from "lodash";
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    ValidateIf,
} from "class-validator";
import { ListGroupOptions } from "@tillywork/shared";
import { ProjectUser } from "../../projects/project-users/project.user.entity";

export class GenerateGroupsParams {
    @IsNotEmpty()
    @IsNumber()
    listId: number;

    @IsNotEmpty()
    @IsEnum(ListGroupOptions)
    groupBy: ListGroupOptions;

    @IsOptional()
    @IsBoolean()
    hideCompleted?: boolean;

    @ValidateIf((o) => o.groupBy === ListGroupOptions.FIELD)
    @IsNotEmpty()
    @IsNumber()
    fieldId?: number;
}

const DEFAULT_GROUP: CreateListGroupDto = {
    name: "All",
    type: ListGroupOptions.ALL,
};

@Injectable()
export class ListGroupsService {
    private readonly logger = new Logger("ListGroupsService");
    constructor(
        @InjectRepository(ListGroup)
        private listGroupsRepository: Repository<ListGroup>,
        private listStagesService: ListStagesService,
        private fieldsService: FieldsService,
        private listsService: ListsService
    ) {}

    async create(createListGroupDto: CreateListGroupDto): Promise<ListGroup> {
        const listGroup = this.listGroupsRepository.create({
            ...createListGroupDto,
            list: {
                id: createListGroupDto.listId,
            },
            field: {
                id: createListGroupDto.fieldId,
            },
        });
        await this.listGroupsRepository.save(listGroup);

        return listGroup;
    }

    findAll({
        listId,
        groupBy,
        fieldId,
    }: {
        listId: number;
        groupBy?: ListGroupOptions;
        fieldId?: number;
    }): Promise<ListGroup[]> {
        const query = this.listGroupsRepository
            .createQueryBuilder("listGroup")
            .innerJoinAndSelect("listGroup.list", "list")
            .leftJoinAndSelect("listGroup.field", "field")
            .where("listGroup.listId = :listId", { listId })
            .orderBy("listGroup.order", "ASC");

        if (groupBy) {
            query.andWhere("listGroup.type = :groupBy", { groupBy });
        }

        if (fieldId) {
            query.andWhere("field.id = :fieldId", { fieldId });
        }

        return query.getMany();
    }

    async generateGroups({
        listId,
        hideCompleted,
        groupBy,
        fieldId,
    }: GenerateGroupsParams): Promise<ListGroup[]> {
        const existingGroups = await this.findAll({
            listId,
            groupBy,
            fieldId,
        });

        let generatedGroups: CreateListGroupDto[];

        const list = await this.listsService.findOne(listId);
        let groupByField: Field;

        switch (groupBy) {
            case ListGroupOptions.LIST_STAGE:
                groupByField = {
                    type: FieldTypes.STAGE,
                } as Field;
                break;

            case ListGroupOptions.FIELD:
                groupByField = await this.fieldsService.findOneBy({
                    id: fieldId,
                    workspace: {
                        id: list.workspaceId,
                    },
                });
                break;

            case ListGroupOptions.ALL:
            default:
        }

        switch (groupByField?.type) {
            case FieldTypes.STAGE:
                generatedGroups = await this.generateGroupsByListStage({
                    listId,
                    hideCompleted,
                });
                break;

            case FieldTypes.USER:
                generatedGroups = await this.generateGroupsByUsers({
                    listId,
                    field: groupByField,
                });
                break;

            case FieldTypes.DATE:
                generatedGroups = await this.generateGroupsByDate({
                    listId,
                    field: groupByField,
                });
                break;

            case FieldTypes.LABEL:
            case FieldTypes.DROPDOWN:
                generatedGroups = this.generateGroupsByFieldItems({
                    listId,
                    field: groupByField,
                });
                break;

            case FieldTypes.CHECKBOX:
                generatedGroups = this.generateGroupsForCheckbox({
                    listId,
                    field: groupByField,
                });
                break;

            default:
                generatedGroups = [
                    {
                        ...DEFAULT_GROUP,
                        listId,
                    },
                ];
        }

        /** Compare generated groups with existing groups */
        const doGroupsMatch =
            existingGroups.length === generatedGroups.length &&
            existingGroups.every((group, index) =>
                this.doesGeneratedGroupMatchExisting(
                    group,
                    generatedGroups[index]
                )
            );

        if (!doGroupsMatch) {
            await this.removeByFieldOrType({
                listId,
                fieldId,
                groupBy,
            });

            const groupPromises = generatedGroups.map((listGroup) =>
                this.create(listGroup)
            );

            await Promise.all(groupPromises);
        }

        const finalGroups = await this.findAll({
            listId,
            groupBy,
            fieldId,
        });

        return finalGroups;
    }

    async generateGroupsByListStage({
        listId,
        hideCompleted,
    }: {
        listId: number;
        hideCompleted: boolean;
    }): Promise<CreateListGroupDto[]> {
        const stages = await this.listStagesService.findAll({
            listId,
            hideCompleted,
        });

        return stages.map((stage) => {
            const group: CreateListGroupDto = {
                type: ListGroupOptions.LIST_STAGE,
                name: stage.name,
                listId,
                entityId: stage.id,
                entityType: ListGroupEntityTypes.LIST_STAGE,
                filter: {
                    where: {
                        and: [
                            {
                                field: "cardLists.listStageId",
                                operator: "eq",
                                value: stage.id,
                            },
                        ],
                    },
                },
                color: stage.color,
                order: stage.order,
            };

            return group;
        });
    }

    async generateGroupsByUsers({
        listId,
        field,
    }: {
        listId: number;
        field?: Field;
    }) {
        const users = (
            await this.listGroupsRepository.manager.find(ProjectUser, {
                where: {
                    project: {
                        workspaces: {
                            spaces: {
                                lists: {
                                    id: listId,
                                },
                            },
                        },
                    },
                },
                order: {
                    createdAt: "ASC",
                },
            })
        ).map((projectUser) => projectUser.user);

        const groups: CreateListGroupDto[] = users.map((user, index) => {
            const group: CreateListGroupDto = {
                type: ListGroupOptions.FIELD,
                name: user.firstName + " " + user.lastName,
                icon: user.photo,
                fieldId: field?.id,
                listId,
                entityId: user.id,
                entityType: ListGroupEntityTypes.USER,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "in",
                                value: [user.id.toString()],
                            },
                        ],
                    },
                },
                order: index + 1,
            };

            return group;
        });

        groups.push({
            type: ListGroupOptions.FIELD,
            name: "Empty",
            fieldId: field?.id,
            listId,
            filter: {
                where: {
                    and: [
                        {
                            field: `card.data.${field.slug}`,
                            operator: "isNull",
                            value: null,
                        },
                    ],
                },
            },
        });

        return groups;
    }

    async generateGroupsByDate({
        listId,
        field,
    }: {
        listId: number;
        field: Field;
    }) {
        const groups: CreateListGroupDto[] = [
            {
                type: ListGroupOptions.FIELD,
                name: "In The Past",
                fieldId: field.id,
                listId,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "lt",
                                value: ":startOfDay",
                            },
                        ],
                    },
                },
                icon: "mdi-clock-time-eight",
                color: "error",
                order: 1,
            },
            {
                type: ListGroupOptions.FIELD,
                name: "Today",
                fieldId: field.id,
                listId,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "between",
                                value: [":startOfDay", ":endOfDay"],
                            },
                        ],
                    },
                },
                icon: "mdi-clock-time-twelve",
                color: "info",
                order: 2,
            },
            {
                type: ListGroupOptions.FIELD,
                name: "Upcoming",
                fieldId: field.id,
                listId,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "gt",
                                value: ":endOfDay",
                            },
                        ],
                    },
                },
                icon: "mdi-clock-time-four",
                color: "default",
                order: 3,
            },
            {
                type: ListGroupOptions.FIELD,
                name: "Empty",
                fieldId: field.id,
                listId,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "isNull",
                                value: null,
                            },
                        ],
                    },
                },
                icon: "mdi-clock-time-six-outline",
                color: "default",
                order: 4,
            },
        ];

        return groups;
    }

    generateGroupsByFieldItems({
        listId,
        field,
    }: {
        listId: number;
        field: Field;
    }) {
        const groups: CreateListGroupDto[] = field.items.map(
            (fieldItem, index) => ({
                name: fieldItem.item,
                type: ListGroupOptions.FIELD,
                color: fieldItem.color,
                icon: fieldItem.icon ?? field.icon,
                listId,
                order: index + 1,
                fieldId: field.id,
                filter: {
                    where: {
                        and: [
                            {
                                field: `card.data.${field.slug}`,
                                operator: "in",
                                value: [fieldItem.item],
                            },
                        ],
                    },
                },
            })
        );

        const emptyGroup: CreateListGroupDto = {
            name: "Empty",
            type: ListGroupOptions.FIELD,
            icon: field.icon,
            listId,
            order: groups.length + 1,
            fieldId: field.id,
            filter: {
                where: {
                    and: [
                        {
                            field: `card.data.${field.slug}`,
                            operator: "isNull",
                            value: null,
                        },
                    ],
                },
            },
        };

        return [...groups, emptyGroup];
    }

    generateGroupsForCheckbox({
        listId,
        field,
    }: {
        listId: number;
        field: Field;
    }) {
        const trueGroup: CreateListGroupDto = {
            name: "True",
            type: ListGroupOptions.FIELD,
            icon: "mdi-check",
            color: "success",
            listId,
            order: 1,
            fieldId: field.id,
            filter: {
                where: {
                    and: [
                        {
                            field: `card.data.${field.slug}`,
                            operator: "eq",
                            value: true,
                        },
                    ],
                },
            },
        };

        const falseGroup: CreateListGroupDto = {
            name: "False",
            type: ListGroupOptions.FIELD,
            icon: "mdi-close",
            color: "error",
            listId,
            order: 1,
            fieldId: field.id,
            filter: {
                where: {
                    and: [
                        {
                            field: `card.data.${field.slug}`,
                            operator: "neOrNull",
                            value: true,
                        },
                    ],
                },
            },
        };

        return [trueGroup, falseGroup];
    }

    async findOne(id: number): Promise<ListGroup> {
        const listGroup = await this.listGroupsRepository.findOne({
            where: {
                id,
            },
        });
        if (!listGroup) {
            throw new NotFoundException(`List Group with ID ${id} not found`);
        }
        return listGroup;
    }

    async update(
        id: number,
        updateListGroupDto: UpdateListGroupDto
    ): Promise<ListGroup> {
        const listGroup = await this.findOne(id);
        this.listGroupsRepository.merge(listGroup, updateListGroupDto);
        return this.listGroupsRepository.save(listGroup);
    }

    async remove(id: number) {
        const listGroup = await this.findOne(id);

        return this.listGroupsRepository.remove(listGroup);
    }

    async removeByFieldOrType({
        listId,
        fieldId,
        groupBy,
    }: {
        listId: number;
        fieldId?: number;
        groupBy: ListGroupOptions;
    }) {
        const listGroups = await this.findAll({
            listId,
            fieldId,
            groupBy,
        });

        return this.listGroupsRepository.remove(listGroups);
    }

    doesGeneratedGroupMatchExisting(
        existing: ListGroup,
        generated: CreateListGroupDto
    ) {
        const fieldCheck =
            (!existing.field && !generated.fieldId) ||
            existing.field.id === generated.fieldId;
        const filterCheck = isEqual(existing.filter, generated.filter);
        const nameCheck = existing.name === generated.name;
        const iconCheck =
            (!existing.icon && !generated.icon) ||
            existing.icon === generated.icon;
        const colorCheck =
            (!existing.color && !generated.color) ||
            existing.color === generated.color;

        return (
            fieldCheck && nameCheck && iconCheck && colorCheck && filterCheck
        );
    }
}
