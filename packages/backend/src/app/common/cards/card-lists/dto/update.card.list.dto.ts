import { PartialType } from "@nestjs/mapped-types";
import { CardList } from "../card.list.entity";

export class UpdateCardListDto extends PartialType(CardList) {}
