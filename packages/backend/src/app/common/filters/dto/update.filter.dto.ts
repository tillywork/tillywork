import { PartialType } from "@nestjs/mapped-types";
import { Filter } from "../filter.entity";

export class UpdateFilterDto extends PartialType(Filter) {}
