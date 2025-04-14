import { IsNotEmpty, IsNumber, IsObject, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ListStage } from "../../lists/list-stages/list.stage.entity";
import { CreatedByType } from "@tillywork/shared";

export class CreateCardDto {
    @IsObject()
    data: Record<string, any>;

    @IsNotEmpty()
    listId: number;

    @IsOptional()
    @IsNumber()
    listStageId?: number;

    @IsOptional()
    @Type(() => ListStage)
    listStage?: ListStage;

    @IsNotEmpty()
    type: number;

    @IsNotEmpty()
    workspaceId: number;

    @IsOptional()
    @IsNumber()
    createdBy?: number;

    @IsOptional()
    createdByType?: CreatedByType;

    @IsOptional()
    @IsNumber()
    parentId?: number;
}
