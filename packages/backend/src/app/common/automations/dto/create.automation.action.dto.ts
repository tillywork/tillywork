/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsEnum, IsNotEmpty } from "class-validator";
import { ActionType } from "../types";

export class CreateAutomationActionDto {
    @IsNotEmpty()
    @IsEnum(ActionType)
    type: ActionType;

    @IsNotEmpty()
    data: any;
}
