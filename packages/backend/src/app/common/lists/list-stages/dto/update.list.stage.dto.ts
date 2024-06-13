import { PartialType } from "@nestjs/mapped-types";
import { ListStage } from "../list.stage.entity";

export class UpdateListStageDto extends PartialType(ListStage) {}
