import { IsEnum, IsNotEmpty } from "class-validator";
import { User } from "../../../users/user.entity";
import {
    ActivityContent,
    ActivityType,
    CreatedByType,
} from "@tillywork/shared";

export class CreateCardActivityDto {
    card: number;

    @IsNotEmpty()
    @IsEnum(ActivityType)
    type: ActivityType;

    @IsNotEmpty()
    content: ActivityContent;

    createdBy?: User;
    createdByType?: CreatedByType;
}
