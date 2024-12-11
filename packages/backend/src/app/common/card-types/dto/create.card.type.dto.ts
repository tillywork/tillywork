import {
    IsEnum,
    IsInstance,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { User } from "../../users/user.entity";
import { Field } from "../../fields/field.entity";
import { Workspace } from "../../workspaces/workspace.entity";
import { CardTypeLayout } from "@tillywork/shared";

export class CreateCardTypeDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;

    @IsOptional()
    @IsEnum(CardTypeLayout)
    layout?: CardTypeLayout;

    @IsOptional()
    @IsInstance(Workspace)
    workspace?: Workspace;

    @IsOptional()
    @IsInstance(User)
    createdBy?: User;

    @IsOptional()
    @IsString()
    createdByType?: "user" | "system";

    @IsOptional()
    fields?: Partial<Field>[];
}
