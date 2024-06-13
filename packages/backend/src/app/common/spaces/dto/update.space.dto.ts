import { PartialType } from "@nestjs/mapped-types";
import { Space } from "../space.entity";

export class UpdateSpaceDto extends PartialType(Space) {}
