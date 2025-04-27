import { WatchableResourceType } from "@tillywork/shared";

export class CreateWatcherDto {
    resourceId: number;
    resourceType: WatchableResourceType;
    userId: number;
}
