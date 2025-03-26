import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { OnEvent } from "@nestjs/event-emitter";
import { Queue } from "bull";

import { AclContext } from "../../auth/context/acl.context";
import { Automation } from "../entities/automation.entity";
import { AutomationsService } from "../services/automations.service";
import { Card } from "../../cards/card.entity";
import { CardsService } from "../../cards/cards.service";
import { TriggerEvent } from "../events/trigger.event";
import { AutomationHandlerRegistry } from "../registries/automation.handler.registry";

@Injectable()
export class AutomationEventHandler {
    private readonly logger = new Logger("AutomationEventHandler");

    constructor(
        @InjectQueue("automation") private automationQueue: Queue,
        private automationService: AutomationsService,
        private readonly aclContext: AclContext,
        private readonly cardsService: CardsService,
        private readonly automationHandlerRegistry: AutomationHandlerRegistry
    ) {}

    @OnEvent("automation.trigger")
    async handleAutomationTrigger(event: TriggerEvent) {
        const card = await this.aclContext.run(true, () =>
            this.cardsService.findOne(event.cardId)
        );

        const triggerLocation = this.getCardLocation(card);
        const automations =
            await this.automationService.findAllInListsAndSpaces({
                triggerType: event.triggerType,
                ...triggerLocation,
            });

        this.logger.debug(`Processing trigger ${event.triggerType}..`);
        this.logger.debug({ event });

        if (!automations.length) {
            this.logger.debug(`No automations found, skipping..`);
            return;
        }

        for (const automation of automations) {
            if (this.shouldRunAutomation(automation, event, card)) {
                this.logger.debug(
                    `Adding automation ID ${automation.id} to queue..`
                );
                await this.automationQueue.add("executeAutomation", {
                    automationId: automation.id,
                    cardId: event.cardId,
                });
            }
        }
    }

    private async shouldRunAutomation(
        automation: Automation,
        event: TriggerEvent,
        card: Card
    ): Promise<boolean> {
        if (!automation.isEnabled) return false;

        const handler = this.automationHandlerRegistry.getTrigger(
            event.triggerType
        );

        return handler.execute(event, { card });
    }

    private getCardLocation(card: Card) {
        const listIds = card.cardLists.map((cl) => cl.list.id);
        const spaceIds = Array.from(
            new Set(card.cardLists.map((cl) => cl.list.space.id))
        );

        return { listIds, spaceIds };
    }
}
