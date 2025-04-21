import { PartialType } from "@nestjs/mapped-types";
import { CreateFieldDto } from "./create.field.dto";

export class UpdateFieldDto extends PartialType(CreateFieldDto) {}
