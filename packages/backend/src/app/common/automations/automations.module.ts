import { forwardRef, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { AutomationsService } from "./services/automations.service";
import { AutomationProcessor } from "./processors/automations.processor";
import { AutomationsController } from "./automations.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Automation } from "./entities/automation.entity";
import { AutomationAction } from "./entities/automation.action.entity";
import { AutomationsEngineService } from "./services/automations.engine.service";
import { ActionHandlerFactory } from "./factories/action.handler.factory";
import {
    CreateCardHandler,
    SendEmailHandler,
    SendWebhookHandler,
    UpdateCardFieldHandler,
} from "./handlers/action.handlers";
import { CardsModule } from "../cards/cards.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Automation, AutomationAction]),
        BullModule.registerQueue({
            name: "automation",
        }),
        forwardRef(() => CardsModule),
    ],
    providers: [
        AutomationsService,
        AutomationsEngineService,
        AutomationProcessor,
        ActionHandlerFactory,
        UpdateCardFieldHandler,
        CreateCardHandler,
        SendEmailHandler,
        SendWebhookHandler,
    ],
    controllers: [AutomationsController],
    exports: [AutomationsService, AutomationsEngineService],
})
export class AutomationsModule {}
