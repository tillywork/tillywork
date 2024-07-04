import { IsNotEmpty } from "class-validator";
import { User } from "../../users/user.entity";

export class CreateCardDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    listId: number;
    @IsNotEmpty()
    listStageId: number;
    @IsNotEmpty()
    type: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description?: any;
    startsAt?: Date;
    dueAt?: Date;
    users?: User[];
    createdBy: number;

    parentCardId?: number;
}
