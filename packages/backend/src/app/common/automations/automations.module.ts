import { forwardRef, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { AutomationsService } from "./services/automations.service";
import { AutomationProcessor } from "./processors/automations.processor";
import { AutomationsController } from "./controllers/automations.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Automation } from "./entities/automation.entity";
import { AutomationStep } from "./entities/automation.step.entity";
import { AutomationEventHandler } from "./handlers/automation.event.handler";
import { CreateCardHandler } from "./handlers/actions/create.card.handler";
import { AutomationRun } from "./entities/automation.run.entity";
import { AutomationStepRun } from "./entities/automation.step.run.entity";
import { AutomationRunsService } from "./services/automation.runs.service";
import { CardsModule } from "../cards/cards.module";
import { AuthModule } from "../auth/auth.module";
import { SetFieldHandler } from "./handlers/actions/set.field.handler";
import { AutomationLocation } from "./entities/automation.location.entity";
import { AutomationHandlerRegistry } from "./registries/automation.handler.registry";
import { AutomationHandlersController } from "./controllers/automation.handlers.controller";
import { CardCreatedHandler } from "./handlers/triggers/card.created.handler";
import { FieldsModule } from "../fields/fields.module";
import { ListsModule } from "../lists/lists.module";
import { FieldUpdatedHandler } from "./handlers/triggers/field.updated.handler";
import { CreateCommentHandler } from "./handlers/actions/create.comment.handler";
import { StageUpdatedHandler } from "./handlers/triggers/stage.updated.handler";
import { CommentCreatedHandler } from "./handlers/triggers/comment.created.handler";
import { ChangeAssigneeHandler } from "./handlers/actions/change.assignee.handler";
import { SetStageHandler } from "./handlers/actions/set.stage.handler";

const handlers = [
    CreateCardHandler,
    SetFieldHandler,
    CardCreatedHandler,
    FieldUpdatedHandler,
    CreateCommentHandler,
    StageUpdatedHandler,
    CommentCreatedHandler,
    ChangeAssigneeHandler,
    SetStageHandler,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Automation,
            AutomationLocation,
            AutomationStep,
            AutomationRun,
            AutomationStepRun,
        ]),
        BullModule.registerQueue({
            name: "automation",
        }),
        forwardRef(() => CardsModule),
        forwardRef(() => AuthModule),
        forwardRef(() => FieldsModule),
        forwardRef(() => ListsModule),
    ],
    providers: [
        ...handlers,
        AutomationsService,
        AutomationEventHandler,
        AutomationRunsService,
        AutomationProcessor,
        AutomationHandlerRegistry,
    ],
    controllers: [AutomationsController, AutomationHandlersController],
    exports: [AutomationsService, AutomationRunsService],
})
export class AutomationsModule {}
