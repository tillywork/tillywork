import {
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ListStage } from "../../lists/list-stages/list.stage.entity";

class CardData {
    title?: string;
    description?: any;
    starts_at?: Date;
    due_at?: Date;
    [key: string]: any; // Allow for additional dynamic fields
}

export class CreateCardDto {
    @IsObject()
    @ValidateNested()
    @Type(() => CardData)
    data: CardData;

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
    createdBy: number;

    @IsOptional()
    @IsNumber()
    parentId?: number;
}
