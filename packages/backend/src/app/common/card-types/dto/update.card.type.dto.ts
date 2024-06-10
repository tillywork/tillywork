import { PartialType } from "@nestjs/mapped-types";
import { CardType } from "../card.type.entity";

export class UpdateCardTypeDto extends PartialType(CardType) {}
