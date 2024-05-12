import { Injectable } from "@nestjs/common";
import { Workspace } from "./workspace.entity";
import { SpacesService } from "../spaces/spaces.service";
import { DEFAULT_SPACES } from "../spaces/types";

@Injectable()
export class WorkspaceSideEffectsService {
    constructor(private spacesService: SpacesService) {}

    async postCreate(workspace: Workspace) {
        const spacePromises = DEFAULT_SPACES.map((space) => {
            return new Promise((resolve) => {
                this.spacesService
                    .create({
                        name: space.name,
                        workspaceId: workspace.id,
                    })
                    .then((space) => resolve(space));
            });
        });

        const result = await Promise.allSettled(spacePromises);

        return result.every((promise) => promise.status === "fulfilled");
    }
}
