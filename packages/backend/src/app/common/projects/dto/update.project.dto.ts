import { PartialType } from "@nestjs/mapped-types";
import { Project } from "../project.entity";

export class UpdateProjectDto extends PartialType(Project) {}
