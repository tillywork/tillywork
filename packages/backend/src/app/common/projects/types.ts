import { List } from "../lists/list.entity";
import { Card } from "../cards/card.entity";

export enum ProjectTypes {
    PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
    CRM = "CRM",
}

export enum ProjectUserActivityTypes {
    ENTITY = "ENTITY",
    SETTING = "SETTING",
}

export type ProjectUserActivityEntity = List | Card;

export enum ProjectUserActivityEntityTypes {
    LIST = "LIST",
    CARD = "CARD",
}
