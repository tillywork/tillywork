import { ActionType, TriggerType } from "@tillywork/shared";

export function isTriggerType(
    type: ActionType | TriggerType
): type is TriggerType {
    return Object.values(TriggerType).includes(type as TriggerType);
}

export function isActionType(
    type: ActionType | TriggerType
): type is ActionType {
    return Object.values(ActionType).includes(type as ActionType);
}
