import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { AutomationValidationService } from "../services/automation.validation.service";
import {
    AutomationValidationResponse,
    ValidateStepParams,
} from "@tillywork/shared";

@ApiTags("Automation Validation")
@Controller({
    path: "automations/validation",
    version: "1",
})
export class AutomationValidationController {
    constructor(
        private readonly validationService: AutomationValidationService
    ) {}

    @Get(":id")
    @ApiOperation({ summary: "Validate an automation" })
    @ApiResponse({
        status: 200,
        description: "Returns true if the automation is valid, false otherwise",
    })
    async validateAutomation(
        @Param("id") id: string
    ): Promise<AutomationValidationResponse> {
        return this.validationService.validateAutomationBeforeRun(id);
    }

    @Post("step")
    @ApiOperation({ summary: "Validate an automation step" })
    @ApiResponse({
        status: 200,
        description: "Returns true if the step is valid, false otherwise",
    })
    async validateStep(
        @Body() body: ValidateStepParams
    ): Promise<AutomationValidationResponse> {
        return this.validationService.validateStep(body);
    }
}
