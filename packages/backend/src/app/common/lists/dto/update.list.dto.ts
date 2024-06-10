import { PartialType } from "@nestjs/mapped-types";
import { List } from "../list.entity";

export class UpdateListDto extends PartialType(List) {}
