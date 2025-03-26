import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Not, Repository } from "typeorm";

import { Automation } from "../entities/automation.entity";
import { AutomationStep } from "../entities/automation.step.entity";
import { AutomationLocation } from "../entities/automation.location.entity";

import { CreateAutomationDto } from "../dto/create.automation.dto";
import { UpdateAutomationDto } from "../dto/update.automation.dto";

import {
    AutomationStepType,
    LocationType,
    TriggerType,
} from "@tillywork/shared";
import { ClsService } from "nestjs-cls";
import { CreateAutomationLocationDto } from "../dto/create.automation.location.dto";

export class FindAllParams {
    workspaceId?: number;
    spaceId?: number;
    listId?: number;
    triggerType?: TriggerType;
    isEnabled?: boolean;
}

@Injectable()
export class AutomationsService {
    constructor(
        @InjectRepository(Automation)
        private automationsRepository: Repository<Automation>,

        @InjectRepository(AutomationStep)
        private automationStepRepository: Repository<AutomationStep>,

        @InjectRepository(AutomationLocation)
        private automationLocationRepository: Repository<AutomationLocation>,

        private clsService: ClsService
    ) {}

    async findAll({
        workspaceId,
        spaceId,
        listId,
        triggerType,
        isEnabled,
    }: FindAllParams): Promise<Automation[]> {
        const queryBuilder = this.automationsRepository
            .createQueryBuilder("automation")
            .leftJoinAndSelect("automation.createdBy", "createdBy")
            .leftJoinAndSelect("automation.locations", "locations")
            .leftJoinAndSelect("locations.space", "space")
            .leftJoinAndSelect("locations.list", "list");

        if (workspaceId) {
            queryBuilder.andWhere("automation.workspaceId = :workspaceId", {
                workspaceId,
            });
        }

        if (spaceId) {
            queryBuilder
                .andWhere(`locations."locationType" = :locationType`, {
                    locationType: LocationType.SPACE,
                })
                .andWhere("locations.locationId = :spaceId", {
                    spaceId,
                });
        }
        if (listId) {
            queryBuilder
                .andWhere(`locations."locationType" = :locationType`, {
                    locationType: LocationType.LIST,
                })
                .andWhere("locations.locationId = :listId", {
                    listId,
                });
        }

        if (triggerType) {
            queryBuilder.andWhere("trigger.value = :triggerType", {
                triggerType,
            });
        }

        if (isEnabled != null) {
            queryBuilder.andWhere("automation.isEnabled = :isEnabled", {
                isEnabled,
            });
        }

        queryBuilder.orderBy("automation.createdAt", "DESC");

        return queryBuilder.getMany();
    }

    async findAllInListsAndSpaces({
        triggerType,
        listIds,
        spaceIds,
    }: {
        triggerType: TriggerType;
        listIds: number[];
        spaceIds: number[];
    }) {
        const queryBuilder = this.automationsRepository
            .createQueryBuilder("automation")
            .leftJoinAndSelect("automation.createdBy", "createdBy")
            .leftJoinAndSelect("automation.locations", "locations")
            .leftJoinAndSelect("automation.trigger", "trigger")
            .andWhere("automation.isEnabled = true")
            .orderBy("automation.createdAt", "DESC");

        if (triggerType) {
            queryBuilder.andWhere("trigger.value = :triggerType", {
                triggerType,
            });
        }

        if (listIds.length > 0 || spaceIds.length > 0) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    if (spaceIds.length > 0) {
                        qb.orWhere(
                            "locations.locationType = :spaceType AND locations.locationId IN (:...spaceIds)",
                            {
                                spaceType: LocationType.SPACE,
                                spaceIds,
                            }
                        );
                    }
                    if (listIds.length > 0) {
                        qb.orWhere(
                            "locations.locationType = :listType AND locations.locationId IN (:...listIds)",
                            {
                                listType: LocationType.LIST,
                                listIds,
                            }
                        );
                    }
                })
            );
        }

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<Automation> {
        const automation = await this.automationsRepository.findOne({
            where: { id },
            relations: [
                "trigger",
                "locations",
                "locations.space",
                "locations.list",
            ],
        });

        if (!automation) {
            throw new NotFoundException();
        }

        automation.steps = await this.loadStepChain(automation.trigger);
        return automation;
    }

    async create(
        createAutomationDto: CreateAutomationDto
    ): Promise<Automation> {
        const {
            steps,
            trigger = {
                type: AutomationStepType.TRIGGER,
                data: {
                    conditions: [],
                },
            },
            ...automationData
        } = createAutomationDto;

        return this.automationsRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const automation = this.automationsRepository.create({
                    ...automationData,
                    workspace: { id: automationData.workspaceId },
                });
                await transactionalEntityManager.save(automation);

                let previousStep: AutomationStep | null = null;

                if (trigger) {
                    const step = this.automationStepRepository.create({
                        ...trigger,
                        automation,
                    });
                    await transactionalEntityManager.save(step);

                    automation.trigger = step;
                    await transactionalEntityManager.save(automation);
                    previousStep = step;
                }

                if (steps) {
                    for (const stepData of steps.entries()) {
                        const step = this.automationStepRepository.create({
                            ...stepData,
                            automation,
                        });

                        await transactionalEntityManager.save(step);

                        if (previousStep) {
                            previousStep.nextStep = step;
                            await transactionalEntityManager.save(previousStep);
                        }

                        previousStep = step;
                    }
                }

                return automation;
            }
        );
    }

    async update(
        id: string,
        updateAutomationDto: UpdateAutomationDto
    ): Promise<Automation> {
        return this.automationsRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const {
                    steps = [],
                    trigger,
                    ...automationData
                } = updateAutomationDto;

                await this.automationLocationRepository.delete({
                    automation: {
                        id,
                    },
                });

                const automation = await this.automationsRepository.findOne({
                    where: { id },
                    relations: [
                        "trigger",
                        "locations",
                        "locations.list",
                        "locations.space",
                    ],
                });

                this.automationsRepository.merge(automation, automationData);
                await transactionalEntityManager.save(automation);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { nextStep, ...triggerData } = trigger;

                const triggerEntity =
                    this.automationStepRepository.create(triggerData);
                await transactionalEntityManager.save(triggerEntity);

                const existingSteps = await this.automationStepRepository.find({
                    where: {
                        automation: {
                            id: automation.id,
                        },
                        type: Not(AutomationStepType.TRIGGER),
                    },
                });

                let previousStep: AutomationStep = triggerEntity;
                for (const step of steps) {
                    let stepEntity: AutomationStep;

                    if (step.id) {
                        stepEntity =
                            await this.automationStepRepository.findOneBy({
                                id: step.id,
                            });

                        stepEntity = this.automationStepRepository.merge(
                            stepEntity,
                            step
                        );
                    } else {
                        stepEntity = this.automationStepRepository.create({
                            ...step,
                            automation: {
                                id: automation.id,
                            },
                        });
                    }
                    await transactionalEntityManager.save(stepEntity);

                    previousStep.nextStep = {
                        id: stepEntity.id,
                    } as AutomationStep;
                    await transactionalEntityManager.save(previousStep);

                    previousStep = stepEntity;
                }

                // The last step should always have no nextStep
                previousStep.nextStep = null;
                await transactionalEntityManager.save(previousStep);

                const receivedStepMap = new Map(
                    steps
                        .filter((step) => step.id)
                        .map((step) => [step.id, step])
                );
                const stepIdsToDelete = existingSteps
                    .filter((step) => !receivedStepMap.has(step.id))
                    .map((step) => step.id);

                if (stepIdsToDelete.length) {
                    await this.automationStepRepository.softDelete(
                        stepIdsToDelete
                    );
                }

                const updatedTrigger =
                    await this.automationStepRepository.findOne({
                        where: {
                            automation: {
                                id: automation.id,
                            },
                            type: AutomationStepType.TRIGGER,
                        },
                    });

                automation.steps = await this.loadStepChain(updatedTrigger);
                return automation;
            }
        );
    }

    async delete(id: string): Promise<void> {
        return this.automationsRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const automation = await this.findOne(id);

                await transactionalEntityManager.delete(AutomationLocation, {
                    automation: {
                        id: automation.id,
                    },
                });
                await transactionalEntityManager.softRemove(automation);
            }
        );
    }

    async duplicate(id: string): Promise<Automation> {
        return this.automationsRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    id: oldId,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    createdBy,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    createdAt,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    updatedAt,
                    trigger,
                    steps,
                    locations,
                    ...automationData
                } = await this.findOne(id);

                const newLocations = locations.map(
                    (location) =>
                        ({
                            locationId: location.locationId,
                            locationType: location.locationType,
                        } as CreateAutomationLocationDto)
                );
                const newSteps = steps.map((step) => ({
                    data: step.data,
                    value: step.value,
                    type: step.type,
                }));

                const newAutomation = transactionalEntityManager.create(
                    Automation,
                    {
                        ...automationData,
                        name: `Copy of ${automationData.name}`,
                        workspace: {
                            id: automationData.workspace.id,
                        },
                        locations: newLocations,
                    }
                );
                await transactionalEntityManager.save(newAutomation);

                let previousStep: AutomationStep | null = null;

                if (trigger) {
                    const step = this.automationStepRepository.create({
                        ...trigger,
                        id: undefined,
                        automation: {
                            id: newAutomation.id,
                        },
                    });
                    await transactionalEntityManager.save(step);

                    newAutomation.trigger = step;
                    await transactionalEntityManager.save(newAutomation);
                    previousStep = step;
                }

                if (newSteps) {
                    for (const stepData of newSteps) {
                        const step = this.automationStepRepository.create({
                            ...stepData,
                            id: undefined,
                            automation: {
                                id: newAutomation.id,
                            },
                        });

                        await transactionalEntityManager.save(step);

                        if (previousStep) {
                            previousStep.nextStep = step;
                            await transactionalEntityManager.save(previousStep);
                        }

                        previousStep = step;
                    }
                }
                return newAutomation;
            }
        );
    }

    /**
     * Retrieves the step entity with the next step loaded.
     * @param id The step ID to load
     * @returns The step data with next step
     */
    async findStepWithNextStep(id: string): Promise<AutomationStep | null> {
        return this.automationStepRepository.findOne({
            where: { id },
            relations: ["nextStep"],
        });
    }

    private async loadStepChain(
        trigger: AutomationStep
    ): Promise<AutomationStep[]> {
        const steps: AutomationStep[] = [];
        const triggerWithNextStep = await this.automationStepRepository.findOne(
            {
                where: {
                    id: trigger.id,
                },
                relations: ["nextStep"],
            }
        );

        if (!triggerWithNextStep.nextStep) {
            return steps;
        }

        const startingStepId = triggerWithNextStep.nextStep.id;
        // Load the full chain using a recursive query for better performance
        const chainQuery = `
          WITH RECURSIVE step_chain AS (
            -- Base case: starting step
            SELECT id, type, value, data, "nextStepId", 0 as depth
            FROM automation_step
            WHERE id = $1
            
            UNION ALL
            
            -- Recursive case: join with next steps
            SELECT s.id, s.type, s.value, s.data, s."nextStepId", sc.depth + 1
            FROM automation_step s
            INNER JOIN step_chain sc ON s.id = sc."nextStepId"
            WHERE s."deletedAt" IS NULL
          )
          SELECT * FROM step_chain
          ORDER BY depth;
        `;

        const rawSteps = await this.automationStepRepository.query(chainQuery, [
            startingStepId,
        ]);

        // Transform raw steps back into entities
        for (const rawStep of rawSteps) {
            const step = this.automationStepRepository.create({
                id: rawStep.id,
                type: rawStep.type,
                value: rawStep.value,
                data: rawStep.data,
            });

            if (rawStep.nextStepId) {
                step.nextStep = { id: rawStep.nextStepId } as AutomationStep;
            }

            steps.push(step);
        }

        // Connect the steps together
        for (let i = 0; i < steps.length - 1; i++) {
            steps[i].nextStep = steps[i + 1];
        }

        return steps;
    }
}
