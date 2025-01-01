export enum ViewTypes {
    TABLE = "table",
    BOARD = "board",
    CALENDAR = "calendar",
    GANTT = "gantt",
    LIST = "list",
}

export type SortDirection = "ASC" | "DESC";

export interface ViewSortOption {
    key: string;
    order: SortDirection;
}
