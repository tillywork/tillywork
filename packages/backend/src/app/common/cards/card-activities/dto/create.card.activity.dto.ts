import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { ActivityContent, ActivityType } from "../card.activity.entity";
import { User } from "../../../users/user.entity";

export class CreateCardActivityDto {
    @IsNotEmpty()
    @IsNumber()
    card: number;

    @IsNotEmpty()
    @IsEnum(ActivityType)
    type: ActivityType;

    @IsNotEmpty()
    content: ActivityContent;

    createdBy: User;
}
