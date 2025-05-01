import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserIntegration } from "./user.integration.entity";
import { UserIntegrationService } from "./services/user.integration.service";
import { UserIntegrationController } from "./controllers/user.integration.controller";
import { ConfigModule } from "@nestjs/config";
import { SlackIntegrationService } from "./services/slack.integration.service";
import { SlackIntegrationController } from "./controllers/slack.integration.controller";

@Module({
    imports: [TypeOrmModule.forFeature([UserIntegration]), ConfigModule],
    providers: [UserIntegrationService, SlackIntegrationService],
    controllers: [UserIntegrationController, SlackIntegrationController],
    exports: [UserIntegrationService, SlackIntegrationService],
})
export class UserIntegrationModule {}
