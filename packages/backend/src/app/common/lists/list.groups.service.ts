import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ListGroup } from "./list.group.entity";
import { ListGroupOptions } from "./types";
import { ListStagesService } from "./list.stages.service";
import { UsersService } from "../users/users.service";
import { QueryFilter } from "../helpers/query.builder.helper";
import { Card } from "../cards/card.entity";
import { CardsService } from "../cards/cards.service";
import dayjs from "dayjs";

export type GenerateGroupsParams = {
    listId: number;
    groupBy: ListGroupOptions;
};

const DEFAULT_GROUP = {
    entityId: null,
    name: "Tasks",
};

@Injectable()
export class ListGroupsService {
    private readonly logger = new Logger("ListGroupsService");
    constructor(
        @InjectRepository(ListGroup)
        private listGroupsRepository: Repository<ListGroup>,
        private listStagesService: ListStagesService,
        private usersService: UsersService,
        private cardsService: CardsService
    ) {}

    async generateGroups({ listId, groupBy }: GenerateGroupsParams) {
        const where: FindOptionsWhere<ListGroup> = {
            list: {
                id: listId,
            },
        };

        const existingGroups = this.listGroupsRepository.findBy(where);

        let cardGroups;

        switch (groupBy) {
            case ListGroupOptions.LIST_STAGE:
                cardGroups = await this.getGroupsByListStage({ listId });
                break;
            case ListGroupOptions.USERS:
                cardGroups = await this.getGroupsByAssignees({ listId });
                break;
            case ListGroupOptions.DUE_DATE:
                cardGroups = await this.getGroupsByDueDate();
                break;
            default:
                cardGroups = [DEFAULT_GROUP];
        }

        await Promise.all(
            cardGroups.map((group) => {
                return new Promise(async (resolve) => {
                    group.cards = await this.getGroupCards({ group });
                    resolve(group.cards.length);
                });
            })
        );

        return cardGroups;
    }

    async getGroupsByListStage({ listId }: { listId: number }) {
        const stages = await this.listStagesService.findAll({ listId });

        return stages.map((stage) => {
            return {
                entityId: stage.id,
                name: stage.name,
                isExpanded: true,
                filters: {
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
            };
        });
    }

    async getGroupsByAssignees({ listId }: { listId: number }) {
        const users = (await this.usersService.findAll()).users;

        const groups: {
            entityId: number | null;
            name: string;
            listId: number;
            isExpanded: boolean;
            filters: QueryFilter;
            cards?: Card[];
        }[] = users.map((user) => {
            return {
                entityId: user.id,
                name: user.firstName + " " + user.lastName,
                listId,
                isExpanded: true,
                filters: {
                    where: {
                        and: [
                            {
                                field: "users.id",
                                operator: "eq",
                                value: user.id,
                            },
                        ],
                    },
                },
            };
        });

        groups.push({
            entityId: null,
            name: "No Assignee",
            listId,
            isExpanded: true,
            filters: {
                where: {
                    and: [
                        {
                            field: "users.id",
                            operator: "isNull",
                            value: null,
                        },
                    ],
                },
            },
        });

        return groups;
    }

    async getGroupsByDueDate() {
        const groups = [
            {
                entityId: null,
                name: "Past Due",
                isExpanded: true,
                filters: {
                    where: {
                        and: [
                            {
                                field: "dueAt",
                                operator: "lt",
                                value: dayjs().startOf("day"),
                            },
                        ],
                    },
                },
            },
            {
                entityId: null,
                name: "Today",
                isExpanded: true,
                filters: {
                    where: {
                        and: [
                            {
                                field: "dueAt",
                                operator: "between",
                                value: [
                                    dayjs().startOf("day"),
                                    dayjs().endOf("day"),
                                ],
                            },
                        ],
                    },
                },
            },
            {
                entityId: null,
                name: "Upcoming",
                isExpanded: true,
                filters: {
                    where: {
                        and: [
                            {
                                field: "dueAt",
                                operator: "gt",
                                value: dayjs().endOf("day"),
                            },
                        ],
                    },
                },
            },
            {
                entityId: null,
                name: "No Due Date",
                isExpanded: true,
                filters: {
                    where: {
                        and: [
                            {
                                field: "dueAt",
                                operator: "isNull",
                                value: null,
                            },
                        ],
                    },
                },
            },
        ];

        return groups;
    }

    async getGroupCards({ group }) {
        return this.cardsService.findAll({
            listId: group.listId,
            filters: group.filters,
        });
    }
}
