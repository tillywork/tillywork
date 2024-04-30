export enum ListGroupOptions {
    ALL = "ALL",
    LIST_STAGE = "LIST_STAGE",
    ASSIGNEES = "ASSIGNEES",
    DUE_DATE = "DUE_DATE",
}

export const DEFAULT_LISTS = [
    {
        name: "Kickoff",
    },
];

export const DEFAULT_LIST_STAGES = [
    {
        name: "To Do",
        color: "rgb(79, 87, 98)",
        order: 1,
    },
    {
        name: "In Progress",
        color: "#2196F3",
        order: 2,
    },
    {
        name: "Done",
        color: "rgb(51, 211, 145)",
        order: 3,
        isCompleted: true,
    },
];

export enum ListGroupEntityTypes {
    LIST_STAGE = "LIST_STAGE",
    USER = "USER",
}
