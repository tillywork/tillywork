import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AutomationRun } from "../entities/automation.run.entity";

import { CreateAutomationRunDto } from "../dto/create.automation.run.dto";
import { UpdateAutomationRunDto } from "../dto/update.automation.run.dto";

export class FindAllParams {
    automationId: string;
}

@Injectable()
export class AutomationRunsService {
    constructor(
        @InjectRepository(AutomationRun)
        private automationRunsRepository: Repository<AutomationRun>
    ) {}

    async findAll({ automationId }: FindAllParams): Promise<AutomationRun[]> {
        const runs = await this.automationRunsRepository.find({
            where: {
                automation: {
                    id: automationId,
                },
            },
        });

        return runs;
    }

    async findOne(id: string) {
        return this.automationRunsRepository.findOneBy({
            id,
        });
    }

    async create(
        createAutomationRunDto: CreateAutomationRunDto
    ): Promise<AutomationRun> {
        const run = this.automationRunsRepository.create({
            ...createAutomationRunDto,
            automation: {
                id: createAutomationRunDto.automationId,
            },
        });

        return this.automationRunsRepository.save(run);
    }

    async update(
        id: string,
        updateRunDto: UpdateAutomationRunDto
    ): Promise<AutomationRun> {
        const run = await this.findOne(id);

        if (!run) {
            throw new NotFoundException();
        }

        this.automationRunsRepository.merge(run, updateRunDto);
        return this.automationRunsRepository.save(run);
    }
}
