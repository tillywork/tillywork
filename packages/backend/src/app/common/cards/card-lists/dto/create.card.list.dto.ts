import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCardListDto {
    @IsNotEmpty()
    cardId: number;
    @IsNotEmpty()
    listId: number;
    @IsNotEmpty()
    listStageId: number;
    @IsNumber()
    order?: number;
}
