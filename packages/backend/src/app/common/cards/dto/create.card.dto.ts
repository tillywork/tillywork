import { IsNotEmpty } from "class-validator";
import { User } from "../../users/user.entity";

export class CreateCardDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    listId: number;
    @IsNotEmpty()
    listStageId: number;

    description?: any;
    dueAt?: Date;
    users?: User[];
    createdBy: number;
}
