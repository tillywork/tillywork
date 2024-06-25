import { IsEnum, IsNotEmpty } from "class-validator";
import { ActivityContent, ActivityType } from "../card.activity.entity";
import { User } from "../../../users/user.entity";

export class CreateCardActivityDto {
    card: number;

    @IsNotEmpty()
    @IsEnum(ActivityType)
    type: ActivityType;

    @IsNotEmpty()
    content: ActivityContent;

    createdBy: User;
}
