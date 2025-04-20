import { PartialType } from "@nestjs/mapped-types";
import { Automation } from "../entities/automation.entity";

export class UpdateAutomationDto extends PartialType(Automation) {}
