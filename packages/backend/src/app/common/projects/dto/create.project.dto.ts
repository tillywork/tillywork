import { Type } from "class-transformer";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { CreateProjectUserDto } from "../project-users/dto/create.project.user.dto";

export class CreateProjectDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsNumber()
    ownerId?: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateProjectUserDto)
    users?: CreateProjectUserDto[];
}
