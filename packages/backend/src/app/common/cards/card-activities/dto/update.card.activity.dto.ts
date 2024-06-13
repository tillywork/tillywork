import { PartialType } from "@nestjs/mapped-types";
import { CardActivity } from "../card.activity.entity";

export class UpdateCardActivityDto extends PartialType(CardActivity) {}
