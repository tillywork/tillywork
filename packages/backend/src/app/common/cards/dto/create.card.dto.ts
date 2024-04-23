import { IsNotEmpty } from "class-validator";

export class CreateCardDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    listId: number;
    @IsNotEmpty()
    listStageId: number;
}
