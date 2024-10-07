import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { CardsService } from "../../cards/cards.service";
import { AutomationsService } from "../services/automations.service";
import { ActionHandlerFactory } from "../factories/action.handler.factory";
import { ActionHandler } from "../handlers/action.handlers";
import { Logger } from "@nestjs/common";

@Processor("automation")
export class AutomationProcessor {
    private readonly logger = new Logger("AutomationProcessor");

    constructor(
        private automationsService: AutomationsService,
        private cardService: CardsService,
        private actionHandlerFactory: ActionHandlerFactory
    ) {}

    @Process("executeAutomation")
    async executeAutomation(
        job: Job<{ automationId: string; cardId: number }>
    ) {
        this.logger.debug(`Processing job with ID ${job.id}`);

        const { automationId, cardId } = job.data;
        const automation = await this.automationsService.findOne(automationId);
        const card = await this.cardService.findOne(cardId);

        let currentAction = automation.firstAction;
        while (currentAction) {
            this.logger.debug(
                `Processing action of type ${currentAction.type}..`
            );
            this.logger.debug({ data: currentAction.data });

            const handler: ActionHandler = this.actionHandlerFactory.getHandler(
                currentAction.type
            );

            this.logger.debug({ handler });
            await handler.execute(currentAction.data, card);
            this.logger.debug(`Action executed, moving to next action..`);
            currentAction = (
                await this.automationsService.findActionWithNextAction(
                    currentAction.id
                )
            ).nextAction;
        }

        this.logger.debug(`Automation executed successfully.`);
    }
}
