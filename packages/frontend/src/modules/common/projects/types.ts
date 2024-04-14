export enum ProjectTypes {
	CRM = 'CRM',
	PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
}

export interface Project {
	name: string;
	ownerId: string;
	projectType: ProjectTypes;
}