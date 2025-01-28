import { AccessType } from "@tillywork/shared";
import { WorkspaceTypes } from "../types";

export class CreateWorkspaceDto {
    name: string;
    ownerId?: number;
    type: WorkspaceTypes;
    accessType: AccessType;
    projectId: number;
}
