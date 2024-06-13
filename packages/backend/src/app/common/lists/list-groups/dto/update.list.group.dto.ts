import { PartialType } from "@nestjs/mapped-types";
import { ListGroup } from "../list.group.entity";

export class UpdateListGroupDto extends PartialType(ListGroup) {}
