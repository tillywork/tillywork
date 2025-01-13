import { Injectable } from "@nestjs/common";
import { AccessControlResourceType } from "@tillywork/shared";
import { AccessStrategy } from "../strategies/access.strategy/access.strategy";
import { WorkspaceAccessStrategy } from "../strategies/access.strategy/workspace.access.strategy";
import { SpaceAccessStrategy } from "../strategies/access.strategy/space.access.strategy";
import { ListAccessStrategy } from "../strategies/access.strategy/list.access.strategy";

@Injectable()
export class AccessStrategyFactory {
    constructor(
        private readonly workspaceAccessStrategy: WorkspaceAccessStrategy,
        private readonly spaceAccessStrategy: SpaceAccessStrategy,
        private readonly listAccessStrategy: ListAccessStrategy
    ) {}

    getStrategy(resourceType: AccessControlResourceType): AccessStrategy {
        switch (resourceType) {
            case "workspace":
                return this.workspaceAccessStrategy;
            case "space":
                return this.spaceAccessStrategy;
            case "list":
                return this.listAccessStrategy;
            default:
                throw new Error(
                    `No strategy found for resource type: ${resourceType}`
                );
        }
    }
}
