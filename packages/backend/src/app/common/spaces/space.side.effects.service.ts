import { Injectable } from "@nestjs/common";
import { Space } from "./space.entity";
import { ListsService } from "../lists/lists.service";
import { DEFAULT_LISTS } from "../lists/types";

@Injectable()
export class SpaceSideEffectsService {
    constructor(private listsService: ListsService) {}

    async postCreate(space: Space) {
        const listPromises = DEFAULT_LISTS.map((list) => {
            return new Promise((resolve) => {
                this.listsService
                    .create({
                        name: list.name,
                        spaceId: space.id,
                    })
                    .then((list) => resolve(list));
            });
        });

        const result = await Promise.allSettled(listPromises);

        return result.every((promise) => promise.status === "fulfilled");
    }
}
