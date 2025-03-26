import { PartialType } from "@nestjs/mapped-types";
import { AutomationRun } from "../entities/automation.run.entity";

export class UpdateAutomationRunDto extends PartialType(AutomationRun) {}
