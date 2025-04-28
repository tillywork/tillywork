import { WatchableResourceType } from "@tillywork/shared";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateWatcherDto {
    @IsNotEmpty()
    @IsNumber()
    resourceId: number;

    @IsNotEmpty()
    resourceType: WatchableResourceType;

    @IsOptional()
    userId?: number;
}
