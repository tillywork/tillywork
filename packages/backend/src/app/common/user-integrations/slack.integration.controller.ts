import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";
import { TillyLogger } from "../logger/tilly.logger";
import { SlackIntegrationService } from "./slack.integration.service";

@UseGuards(JwtAuthGuard) // or your auth guard
@Controller({
    path: "slack",
    version: "1",
})
export class SlackIntegrationController {
    private readonly logger = new TillyLogger("SlackIntegrationController");

    constructor(
        private readonly slackIntegrationService: SlackIntegrationService
    ) {}

    @Get("channels")
    async getChannels(@CurrentUser() user: User) {
        return this.slackIntegrationService.listChannels(user.id);
    }
}
