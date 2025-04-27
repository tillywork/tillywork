import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { MailerService } from "./mailer.service";
import { MailerProcessor } from "./mailer.processer";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Email } from "./email.entity";
import { MailerController } from "./mailer.controller";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "emails",
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
