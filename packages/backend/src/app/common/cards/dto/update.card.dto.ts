import { PartialType } from "@nestjs/mapped-types";
import { Card } from "../card.entity";

export class UpdateCardDto extends PartialType(Card) {}
