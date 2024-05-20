import { PartialType } from "@nestjs/mapped-types";
import { ProjectUser } from "../project.user.entity";

export class UpdateProjectUserDto extends PartialType(ProjectUser) {}
