import { Injectable } from "@nestjs/common";
import { Automation } from "../entities/automation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAutomationDto } from "../dto/create.automation.dto";
import { UpdateAutomationDto } from "../dto/update.automation.dto";
import { AutomationAction } from "../entities/automation.action.entity";
import { TriggerType } from "../types";

export class FindAllParams {
    workspaceId: number;
    triggerType?: TriggerType;
}

@Injectable()
export class AutomationsService {
    constructor(
        @InjectRepository(Automation)
        private automationsRepository: Repository<Automation>,

        @InjectRepository(AutomationAction)
        private automationActionRepository: Repository<AutomationAction>
    ) {}

    async findAll({
        workspaceId,
        triggerType,
    }: FindAllParams): Promise<Automation[]> {
        return this.automationsRepository.find({
            where: {
                triggerType,
                workspace: {
                    id: workspaceId,
                },
            },
            order: {
                createdAt: "DESC",
            },
        });
    }

    async findOne(id: string) {
        return this.automationsRepository.findOneBy({
            id,
        });
    }

    async create(
        createAutomationDto: CreateAutomationDto
    ): Promise<Automation> {
        const { actions, ...automationData } = createAutomationDto;

        const automation = this.automationsRepository.create({
            ...automationData,
            workspace: {
                id: automationData.workspaceId,
            },
        });
        await this.automationsRepository.save(automation);

        let previousAction: AutomationAction | null = null;
        for (const actionData of actions) {
            const action = this.automationActionRepository.create({
                ...actionData,
                automation,
            });
            await this.automationActionRepository.save(action);

            if (!previousAction) {
                automation.firstAction = action;
                await this.automationsRepository.save(automation);
            } else {
                previousAction.nextAction = action;
                await this.automationActionRepository.save(previousAction);
            }

            previousAction = action;
        }

        return automation;
    }

    async update(
        id: string,
        updateAutomationDto: UpdateAutomationDto
    ): Promise<Automation> {
        const automation = await this.findOne(id);

        this.automationsRepository.merge(automation, updateAutomationDto);
        return this.automationsRepository.save(automation);
    }

    async delete(id: string): Promise<void> {
        const automation = await this.findOne(id);

        await this.automationsRepository.softRemove(automation);
    }

    /**
     * Retrieves the action entity with the next action loaded.
     * @param id The action to load
     * @returns The action data with next action
     */
    async findActionWithNextAction(
        id: string
    ): Promise<AutomationAction | null> {
        return this.automationActionRepository.findOne({
            where: { id },
            relations: ["nextAction"],
        });
    }
}
