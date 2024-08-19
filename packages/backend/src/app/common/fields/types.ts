export enum FieldTypes {
    TEXT = "text",
    TEXT_AREA = "text_area",
    DROPDOWN = "dropdown",
    LABEL = "label",
    USER = "user",
    DATE = "date",
    NUMBER = "number",
    CHECKBOX = "checkbox",
    EMAIL = "email",
    URL = "url",
    CURRENCY = "currency",
    STAGE = "stage",
    RICH = "rich",
    CARD = "card",
}

export type FieldItem = {
    item: string;
    color?: string;
    icon?: string;
};
