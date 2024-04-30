import { Injectable } from "@nestjs/common";
import { List } from "./list.entity";
import { ListStagesService } from "./list.stages.service";
import { DEFAULT_LIST_STAGES } from "./types";
import { ViewsService } from "../views/views.service";
import { DEFAULT_VIEWS } from "../views/types";

@Injectable()
export class ListSideEffectsService {
    constructor(
        private listStagesService: ListStagesService,
        private viewsService: ViewsService
    ) {}

    async postCreate(list: List) {
        const defaultStagesPromises = DEFAULT_LIST_STAGES.map((stage) => {
            return new Promise((resolve) => {
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

        const defaultViewsPromises = DEFAULT_VIEWS.map((view) => {
            return new Promise((resolve) => {
                this.viewsService
                    .create({
                        name: view.name,
                        listId: list.id,
                        type: view.type,
                    })
                    .then((view) => resolve(view));
            });
        });

        const result = await Promise.allSettled([
            ...defaultStagesPromises,
            ...defaultViewsPromises,
        ]);
        return result.every((promise) => promise.status === "fulfilled");
    }
}
