export interface Workspace {
	id: number;
	name: string;
	ownerId: number;
    projectId: number;
    workspaceType: WorkspaceTypes;
	createdAt: string;
	updatedAt: string;
}

export enum WorkspaceTypes {
	CRM = 'CRM',
	PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
}