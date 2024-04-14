import { WorkspaceTypes } from "../types";

export class CreateWorkspaceDto {
  name: string;
  ownerId?: number;
  workspaceType: WorkspaceTypes;
  projectId: number;
}
