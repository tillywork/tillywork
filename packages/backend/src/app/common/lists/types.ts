export const DEFAULT_LISTS = [
    {
        name: "Kickoff",
    },
];

export const DEFAULT_LIST_STAGES = [
    {
        name: "To Do",
        color: "default",
        order: 1,
    },
    {
        name: "In Progress",
        color: "info",
        order: 2,
    },
    {
        name: "Done",
        color: "success",
        order: 3,
        isCompleted: true,
    },
];

export enum ListGroupEntityTypes {
    LIST_STAGE = "list_stage",
    USER = "user",
}
