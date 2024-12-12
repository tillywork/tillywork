import { IsEnum, IsNotEmpty } from "class-validator";
import { ActivityContent } from "../card.activity.entity";
import { User } from "../../../users/user.entity";
import { ActivityType } from "@tillywork/shared";

export class CreateCardActivityDto {
    card: number;

    @IsNotEmpty()
    @IsEnum(ActivityType)
    type: ActivityType;

    @IsNotEmpty()
    content: ActivityContent;

    createdBy: User;
}
