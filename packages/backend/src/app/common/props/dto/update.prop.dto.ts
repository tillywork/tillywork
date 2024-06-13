import { PartialType } from "@nestjs/mapped-types";
import { Prop } from "../prop.entity";

export class UpdatePropDto extends PartialType(Prop) {}
