import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCardTypeDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;
}
