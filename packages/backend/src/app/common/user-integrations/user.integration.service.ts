import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserIntegration } from "./user.integration.entity";
import { UpsertUserIntegrationDto } from "./dto/upsert.user.integration.dto";
import { IntegrationType } from "@tillywork/shared";

@Injectable()
export class UserIntegrationService {
    constructor(
        @InjectRepository(UserIntegration)
        private readonly integrationRepo: Repository<UserIntegration>
    ) {}

    async findAll({
        userId,
        type,
    }: {
        userId: number;
        type?: IntegrationType;
    }) {
        return this.integrationRepo.find({
            where: { user: { id: userId }, type },
        });
    }

    async findOne({ userId, type }: { userId: number; type: IntegrationType }) {
        return this.integrationRepo.findOne({
            where: { user: { id: userId }, type },
        });
    }

    async upsertForUser(userId: number, dto: UpsertUserIntegrationDto) {
        let integration = await this.integrationRepo.findOne({
            where: { user: { id: userId }, type: dto.type },
        });
        if (!integration) {
            integration = this.integrationRepo.create({
                user: { id: userId },
                type: dto.type,
            });
        }
        integration.config = dto.config;
        return this.integrationRepo.save(integration);
    }

    async removeForUser(userId: number, type: IntegrationType) {
        return this.integrationRepo.delete({ user: { id: userId }, type });
    }
}
