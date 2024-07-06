import { PartialType } from "@nestjs/mapped-types";
import { TWFile } from "../file.entity";

export class UpdateFileDto extends PartialType(TWFile) {}
