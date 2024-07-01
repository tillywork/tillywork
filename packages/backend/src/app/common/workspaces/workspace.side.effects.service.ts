import { Injectable } from "@nestjs/common";
import { Workspace } from "./workspace.entity";
import { SpacesService } from "../spaces/spaces.service";
import { DEFAULT_SPACES } from "../spaces/types";
import { CardTypesService } from "../card-types/card.types.service";

@Injectable()
export class WorkspaceSideEffectsService {
    constructor(
        private spacesService: SpacesService,
        private cardTypesService: CardTypesService
    ) {}

    async postCreate(workspace: Workspace) {
        const spacePromises = DEFAULT_SPACES.map((space) => {
            return new Promise((resolve) => {
                this.spacesService
                    .create({
                        name: space.name,
                        workspaceId: workspace.id,
                        createOnboardingData: true,
                    })
                    .then((space) => resolve(space));
            });
        });

        const result = await Promise.allSettled(spacePromises);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (result[0] as any).value;
    }

    async createDefaultCardTypes(workspace: Workspace) {
        return this.cardTypesService.createDefaultWorkspaceTypes(workspace);
    }
}
