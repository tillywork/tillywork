import { PartialType } from "@nestjs/mapped-types";
import { Workspace } from "../workspace.entity";

export class UpdateWorkspaceDto extends PartialType(Workspace) {}
