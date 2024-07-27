import { WorkspaceTypes } from "../types";

export class CreateWorkspaceDto {
    name: string;
    slug: string;
    ownerId?: number;
    type: WorkspaceTypes;
    projectId: number;
    createOnboardingData?: boolean;
}
