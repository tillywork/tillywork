import { Injectable } from "@nestjs/common";
import { List } from "./list.entity";
import { ListStagesService } from "./list-stages/list.stages.service";
import { DEFAULT_LIST_STAGES } from "./types";
import { ViewsService } from "../views/views.service";
import { ListStage } from "./list-stages/list.stage.entity";
import { ListGroupOptions, ListType, ViewTypes } from "@tillywork/shared";

@Injectable()
export class ListSideEffectsService {
    constructor(
        private listStagesService: ListStagesService,
        private viewsService: ViewsService
    ) {}

    async postCreate({
        list,
        defaultViewType,
        createDefaultStages,
    }: {
        list: List;
        defaultViewType?: ViewTypes;
        createDefaultStages: boolean;
    }) {
        if (createDefaultStages) {
            if (list.type === ListType.DEALS) {
                list = await this.createCrmDealStages(list);
            } else {
                list = await this.createDefaultStages(list);
            }
        }

        list = await this.createDefaultTableView({
            list,
            defaultViewType,
        });

        return list;
    }

    async createDefaultStages(list: List): Promise<List> {
        const defaultStagesPromises = DEFAULT_LIST_STAGES.map((stage) => {
            return new Promise<ListStage>((resolve) => {
                this.listStagesService
                    .create({
                        name: stage.name,
                        listId: list.id,
                        color: stage.color,
                        order: stage.order,
                        isCompleted: stage.isCompleted,
                    })
                    .then((stage) => resolve(stage));
            });
        });

        list.listStages = await Promise.all(defaultStagesPromises);

        return list;
    }

    async createCrmDealStages(list: List): Promise<List> {
        const dealStages = [
            {
                name: "Lead",
                color: "default",
            },
            {
                name: "Qualified",
                color: "success",
            },
            {
                name: "Meeting Scheduled",
                color: "success",
            },
            {
                name: "Demo",
                color: "success",
            },
            {
                name: "Proposal Made",
                color: "success",
            },
            {
                name: "Negotiations",
                color: "success",
            },
            {
                name: "Won",
                color: "success",
            },
            {
                name: "Lost",
                color: "error",
            },
        ];

        const defaultStagesPromises = dealStages.map((stage, index) => {
            return new Promise<ListStage>((resolve) => {
                this.listStagesService
                    .create({
                        name: stage.name,
                        listId: list.id,
                        color: stage.color,
                        order: index + 1,
                    })
                    .then((stage) => resolve(stage));
            });
        });

        list.listStages = await Promise.all(defaultStagesPromises);

        return list;
    }

    async createDefaultTableView({
        list,
        defaultViewType = ViewTypes.TABLE,
    }: {
        list: List;
        defaultViewType: ViewTypes;
    }): Promise<List> {
        const viewOptions = [
            {
                name: "Table",
                type: ViewTypes.TABLE,
            },
            {
                name: "Board",
                type: ViewTypes.BOARD,
            },
        ];
        const selectedViewType = viewOptions.find(
            (option) => option.type === defaultViewType
        );

        const defaultView = await this.viewsService.create({
            name: selectedViewType.name,
            listId: list.id,
            type: selectedViewType.type,
            options: {
                groupBy: {
                    type: list.listStages?.length
                        ? ListGroupOptions.LIST_STAGE
                        : ListGroupOptions.ALL,
                },
            },
        });

        list.views = [defaultView];

        return list;
    }
}
