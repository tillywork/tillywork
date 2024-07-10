import { PartialType } from "@nestjs/mapped-types";
import { View } from "../view.entity";

export class UpdateViewDto extends PartialType(View) {}
