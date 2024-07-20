import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Card } from "../../cards/card.entity";
import { CardsService } from "../../cards/cards.service";
import { Automation } from "../entities/automation.entity";
import { AutomationsService } from "./automations.service";
import { TriggerType } from "../types";

@Injectable()
export class AutomationsEngineService {
    private readonly logger = new Logger("AutomationEngineService");

    constructor(
        @InjectQueue("automation") private automationQueue: Queue,
        private automationService: AutomationsService,
        private cardService: CardsService
    ) {}

    async processAutomations({
        trigger,
        cardId,
    }: {
        trigger: TriggerType;
        cardId: number;
    }): Promise<void> {
        const card = await this.cardService.findOne(cardId);
        const automations = await this.automationService.findAll({
            triggerType: trigger,
            workspaceId: card.workspaceId,
        });

        this.logger.debug(
            `Processing ${trigger} event for card with ID ${cardId} in workspace ${card.workspaceId}`
        );

        if (!automations.length) {
            this.logger.debug(`No automations found, skipping.`);
            return;
        }

        for (const automation of automations) {
            if (this.shouldRunAutomation(automation, trigger, card)) {
                this.logger.debug(
                    `Adding automation ID ${automation.id} to queue..`
                );
                await this.automationQueue.add("executeAutomation", {
                    automationId: automation.id,
                    cardId: card.id,
                });
            }
        }
    }

    private shouldRunAutomation(
        automation: Automation,
        trigger: TriggerType,
        card: Card
    ): boolean {
        return true;
    }
}
