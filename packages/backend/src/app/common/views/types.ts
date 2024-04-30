export enum ViewTypes {
    TABLE = "table",
    BOARD = "board",
    CALENDAR = "calendar",
    GANTT = "gantt",
}

export const DEFAULT_VIEWS = [
    {
        name: "Table",
        type: ViewTypes.TABLE,
    },
];
