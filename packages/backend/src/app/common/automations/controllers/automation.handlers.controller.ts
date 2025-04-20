import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    NotFoundException,
    Post,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { AutomationHandlerRegistry } from "../registries/automation.handler.registry";
import { GetHandlerFieldsParams } from "@tillywork/shared";
import { isTriggerType, isActionType } from "../helpers/handler.type.helper";

@ApiBearerAuth()
@ApiTags("automations")
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
    path: "automations/handlers",
    version: "1",
})
export class AutomationHandlersController {
    constructor(private handlerRegistry: AutomationHandlerRegistry) {}

    @Get("triggers")
    findTriggers() {
        const triggers = this.handlerRegistry
            .getAllTriggers()
            .map(async (handler) => handler.metadata);

        return Promise.all(triggers);
    }

    @Get("actions")
    findActions() {
        const actions = this.handlerRegistry
            .getAllActions()
            .map(async (handler) => handler.metadata);

        return Promise.all(actions);
    }

    @Post("/fields")
    async getHandlerFields(@Body() body: GetHandlerFieldsParams) {
        const { type } = body;
        if (isTriggerType(type)) {
            const handler = this.handlerRegistry.getTrigger(type);
            if (handler) {
                return handler.getFields(body);
            }
        }

        if (isActionType(type)) {
            const handler = this.handlerRegistry.getAction(type);
            if (handler) {
                return handler.getFields(body);
            }
        }

        throw new NotFoundException(`Handler type '${type}' not found`);
    }

    @Post("/sample-data")
    async getHandlerSampleData(@Body() body: GetHandlerFieldsParams) {
        const { type } = body;
        if (isTriggerType(type)) {
            const handler = this.handlerRegistry.getTrigger(type);
            if (handler) {
                return handler.getSampleData(body);
            }
        }

        if (isActionType(type)) {
            const handler = this.handlerRegistry.getAction(type);
            if (handler) {
                return handler.getSampleData(body);
            }
        }

        throw new NotFoundException(`Handler type '${type}' not found`);
    }
}
