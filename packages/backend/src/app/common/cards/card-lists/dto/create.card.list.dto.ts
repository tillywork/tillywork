import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateCardListDto {
    @IsNotEmpty()
    @IsNumber()
    cardId: number;
    @IsNotEmpty()
    @IsNumber()
    listId: number;
    @IsNotEmpty()
    @IsNumber()
    listStageId: number;
    @IsNumber()
    @IsOptional()
    order?: number;
}
