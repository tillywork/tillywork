import {
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { User } from "../../users/user.entity";
import { Type } from "class-transformer";

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
    listStageId: number;

    @IsNotEmpty()
    type: number;

    @IsNotEmpty()
    workspaceId: number;

    users?: User[];
    createdBy: number;

    parentId?: number;
}
