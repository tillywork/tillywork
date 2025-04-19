import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

import { Repository } from "typeorm";
import { TillyLogger } from "../../logger/tilly.logger";
import { InjectRepository } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";

import { AutomationsService } from "../services/automations.service";
import { AutomationRunsService } from "../services/automation.runs.service";
import { CardsService } from "../../cards/cards.service";
import { AclContext } from "../../auth/context/acl.context";
import { PlaceholderProcessorService } from "../services/placeholder.processor.service";

import { AutomationStepRun } from "../entities/automation.step.run.entity";

import { ActionType, AutomationRunStatus } from "@tillywork/shared";
import { AutomationHandlerRegistry } from "../registries/automation.handler.registry";
import { AutomationHandler } from "../handlers/automation.handler";

@Processor("automation")
export class AutomationProcessor {
    private readonly logger = new TillyLogger("AutomationProcessor");

    constructor(
        private automationsService: AutomationsService,
        private automationHandlerRegistry: AutomationHandlerRegistry,
        private readonly automationRunsService: AutomationRunsService,
        @InjectRepository(AutomationStepRun)
        private stepRunRepository: Repository<AutomationStepRun>,
        private readonly cardsService: CardsService,
        private readonly aclContext: AclContext,
        private readonly clsService: ClsService,
        private readonly placeholderProcessor: PlaceholderProcessorService
    ) {}

    @Process("executeAutomation")
    async executeAutomation(
        job: Job<{ automationId: string; cardId: number; payload: any }>
    ) {
        const run = await this.automationRunsService.create({
            automationId: job.data.automationId,
        });

        this.logger.debug(
            `Processing job with ID ${job.id}, run ${run.id} created...`
        );

        try {
            const { automationId } = job.data;
            const automation = await this.automationsService.findOne(
                automationId
            );

            let currentStep = automation.steps[0];
            let stepOrder = 0;
            const runOutput: any[] = [job.data.payload ?? {}];

            this.clsService.enter();
            this.clsService.set("isAutomation", true);

            while (currentStep) {
                this.logger.debug(`Processing step ${currentStep.value}..`);
                const stepStart = Date.now();

                const card = await this.aclContext.run(true, () =>
                    this.cardsService.findOne(job.data.cardId)
                );

                const processedData = this.placeholderProcessor.processStepData(
                    currentStep,
                    runOutput
                );

                const stepRun = await this.stepRunRepository.save({
                    run,
                    step: currentStep,
                    order: stepOrder,
                    input: processedData,
                    status: AutomationRunStatus.PENDING,
                });

                try {
                    const handler: AutomationHandler =
                        this.automationHandlerRegistry.getAction(
                            currentStep.value as ActionType
                        );
                    const output = await handler.execute(processedData, {
                        card,
                        automation,
                    });

                    await this.stepRunRepository.update(stepRun.id, {
                        status: AutomationRunStatus.COMPLETED,
                        output,
                        duration: Date.now() - stepStart,
                    });

                    runOutput.push(output);

                    this.logger.debug(
                        `Action executed successfully, moving to next action..`
                    );

                    currentStep = automation.steps[++stepOrder];
                } catch (stepError) {
                    this.logger.debug(`Action ${currentStep.value} failed.`);
                    const sanitizedError = this.sanitizeError(stepError);
                    this.logger.debug(sanitizedError);
                    await this.stepRunRepository.update(stepRun.id, {
                        status: AutomationRunStatus.FAILED,
                        error: sanitizedError,
                        duration: Date.now() - stepStart,
                    });
                    throw stepError;
                }
            }

            await this.automationRunsService.update(run.id, {
                status: AutomationRunStatus.COMPLETED,
            });

            this.logger.debug(`Automation executed successfully.`);
        } catch (error) {
            await this.automationRunsService.update(run.id, {
                status: AutomationRunStatus.FAILED,
                error: this.sanitizeError(error),
            });
            throw error;
        }
    }

    private sanitizeError(error: any) {
        return {
            message: error.message,
            stack: error.stack,
            ...(error.response && { response: error.response }),
        };
    }
}
