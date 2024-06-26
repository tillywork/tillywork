import { PartialType } from "@nestjs/mapped-types";
import { Field } from "../field.entity";

export class UpdateFieldDto extends PartialType(Field) {}
