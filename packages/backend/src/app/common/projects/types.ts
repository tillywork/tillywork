import { List } from "../lists/list.entity";
import { Card } from "../cards/card.entity";

export enum ProjectTypes {
    PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
    CRM = "CRM",
}

export enum ProjectUserActivityTypes {
    VIEW = "VIEW",
    // SETTING = "SETTING", // Tracks user navigation to the setting page
}

export type ProjectUserActivityEntity = List | Card;

export enum ProjectUserActivityEntityTypes {
    LIST = "LIST",
    CARD = "CARD",
}
