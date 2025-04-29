import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserIntegration } from "./user.integration.entity";
import { UserIntegrationService } from "./user.integration.service";
import { UserIntegrationController } from "./user.integration.controller";
import { ConfigModule } from "@nestjs/config";
import { SlackIntegrationService } from "./slack.integration.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserIntegration]), ConfigModule],
    providers: [UserIntegrationService, SlackIntegrationService],
    controllers: [UserIntegrationController],
    exports: [UserIntegrationService, SlackIntegrationService],
})
export class UserIntegrationModule {}
