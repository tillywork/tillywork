import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { CurrentUser } from "../../auth/decorators/current.user.decorator";
import { User } from "../../users/user.entity";
import { UserIntegrationService } from "../services/user.integration.service";
import { UpsertUserIntegrationDto } from "../dto/upsert.user.integration.dto";
import { IntegrationType } from "@tillywork/shared";
import { ConfigService } from "@nestjs/config";
import { TillyLogger } from "../../logger/tilly.logger";
import { SlackIntegrationService } from "../services/slack.integration.service";

@Controller({
    path: "user-integrations",
    version: "1",
})
export class UserIntegrationController {
    private readonly logger = new TillyLogger("UserIntegrationController");

    constructor(
        private readonly service: UserIntegrationService,
        private readonly configService: ConfigService,
        private readonly slackIntegrationService: SlackIntegrationService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query("type") type?: IntegrationType
    ) {
        return this.service.findAll({ userId: user.id, type });
    }

    @UseGuards(JwtAuthGuard)
    @Get(":type")
    async findByType(
        @CurrentUser() user: User,
        @Param("type") type: IntegrationType
    ) {
        return this.service.findOne({ userId: user.id, type });
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async upsert(
        @CurrentUser() user: User,
        @Body() dto: UpsertUserIntegrationDto
    ) {
        return this.service.upsertForUser(user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":type")
    async remove(
        @CurrentUser() user: User,
        @Param("type") type: IntegrationType
    ) {
        return this.service.removeForUser(user.id, type);
    }

    @UseGuards(JwtAuthGuard)
    @Get("auth")
    async getAuthUrl(
        @CurrentUser() user: User,
        @Query("integration") integration: IntegrationType
    ) {
        switch (integration) {
            case IntegrationType.SLACK:
                return {
                    url: this.slackIntegrationService.getAuthUrl(user.id),
                };
            // Add more integrations here
            default:
                throw new Error("Unsupported integration");
        }
    }

    @Get("redirect")
    async integrationCallback(
        @Query("code") code: string,
        @Query("state") state: string
    ) {
        const decoded = JSON.parse(Buffer.from(state, "base64").toString());
        const { integration } = decoded;

        switch (integration) {
            case IntegrationType.SLACK:
                await this.slackIntegrationService.handleOAuthCallback(
                    code,
                    state
                );
                break;
            // Add more integrations here
            default:
                throw new Error("Unsupported integration");
        }

        return {
            message: "Connected successfully. You can now close this window.",
        };
    }
}
