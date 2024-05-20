import { IsNotEmpty } from "class-validator";
import { User } from "../../../users/user.entity";
import { Project } from "../../project.entity";

export class CreateProjectUserDto {
    @IsNotEmpty()
    user: User;

    @IsNotEmpty()
    role: string;

    @IsNotEmpty()
    project: Project;
}
