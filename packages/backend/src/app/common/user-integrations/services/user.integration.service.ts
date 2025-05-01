import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserIntegration } from "../user.integration.entity";
import { UpsertUserIntegrationDto } from "../dto/upsert.user.integration.dto";
import { IntegrationType } from "@tillywork/shared";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserIntegrationService {
    constructor(
        @InjectRepository(UserIntegration)
        private readonly integrationRepo: Repository<UserIntegration>,
        private readonly configService: ConfigService
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
                ...dto,
                user: { id: userId },
            });
        }

        this.integrationRepo.merge(integration, dto);
        return this.integrationRepo.save(integration);
    }

    async removeForUser(userId: number, type: IntegrationType) {
        return this.integrationRepo.delete({ user: { id: userId }, type });
    }

    getEnabledIntegrations() {
        const enabled = this.configService
            .get("TW_ENABLED_INTEGRATIONS")
            .split(",")
            .filter((integration) => Boolean(integration));

        return { enabled };
    }
}
