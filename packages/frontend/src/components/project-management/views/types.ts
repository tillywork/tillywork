import type { List } from "../lists/types"

export interface View {
    id: number
    name: string
    viewType: ViewTypes
    listId: number
    list: List
}

export enum ViewTypes {
    TABLE = 'table',
    BOARD = 'board',
    CALENDAR = 'calendar',
    GANTT = 'gantt',
}