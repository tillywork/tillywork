import { Injectable } from "@nestjs/common";
import { List } from "./list.entity";
import { ListStagesService } from "./list-stages/list.stages.service";
import { DEFAULT_LIST_STAGES } from "./types";
import { ViewsService } from "../views/views.service";
import { DEFAULT_VIEWS } from "../views/types";
import { ListStage } from "./list-stages/list.stage.entity";
import { View } from "../views/view.entity";

@Injectable()
export class ListSideEffectsService {
    constructor(
        private listStagesService: ListStagesService,
        private viewsService: ViewsService
    ) {}

    async postCreate({
        list,
        createDefaultStages,
    }: {
        list: List;
        createDefaultStages: boolean;
    }) {
        if (createDefaultStages) {
            list = await this.createDefaultStages(list);
        }

        list = await this.createDefaultTableView(list);

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

    async createDefaultTableView(list: List): Promise<List> {
        const defaultViewsPromises = DEFAULT_VIEWS.map((view) => {
            return new Promise<View>((resolve) => {
                this.viewsService
                    .create({
                        name: view.name,
                        listId: list.id,
                        type: view.type,
                    })
                    .then((view) => resolve(view));
            });
        });

        list.views = await Promise.all(defaultViewsPromises);

        return list;
    }
}
