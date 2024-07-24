import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { MailerService } from "./mailer.service";
import { MailerProcessor } from "./mailer.processer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Email } from "./email.entity";
import { MailerController } from "./mailer.controller";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get("TW_REDIS_HOST"),
                    port: configService.get("TW_REDIS_PORT"),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: "email",
            // Limited to 1 email per second
            limiter: {
                max: 1,
                duration: 1000 * 1,
            },
        }),
        ConfigModule,
        TypeOrmModule.forFeature([Email]),
        UsersModule,
    ],
    controllers: [MailerController],
    providers: [MailerService, MailerProcessor],
    exports: [MailerService],
})
export class MailerModule {}
