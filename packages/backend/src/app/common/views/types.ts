export enum ViewTypes {
    TABLE = "table",
    BOARD = "board",
    CALENDAR = "calendar",
    GANTT = "gantt",
    LIST = "list",
}

export const DEFAULT_VIEWS = [
    {
        name: "Table",
        type: ViewTypes.TABLE,
    },
];

export type SortDirection = "ASC" | "DESC";

export interface ViewSortOption {
    key: string;
    order: SortDirection;
}
