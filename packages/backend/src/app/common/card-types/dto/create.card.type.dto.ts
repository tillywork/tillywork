import { IsInstance, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { User } from "../../users/user.entity";
import { Field } from "../../fields/field.entity";

export class CreateCardTypeDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;

    @IsOptional()
    @IsInstance(User)
    createdBy?: User;

    @IsOptional()
    fields?: Partial<Field>[];
}
