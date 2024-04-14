export interface Space {
	id: number;
	name: string;
	workspaceId: number;
	lists: List[];
}

export interface List {
	id: number;
	name: string;
	spaceId: number;
}