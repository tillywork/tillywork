import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateListStageDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    listId: number;
    @IsNotEmpty()
    @IsString()
    color: string;
    @IsNotEmpty()
    @IsNumber()
    order: number;
    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean;
}
