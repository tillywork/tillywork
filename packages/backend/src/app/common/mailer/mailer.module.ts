import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { MailerService } from "./mailer.service";
import { MailerProcessor } from "./mailer.processer";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "email",
            // Limited to 1 email per second
            limiter: {
                max: 1,
                duration: 1000 * 1,
            },
        }),
        ConfigModule,
    ],
    providers: [MailerService, MailerProcessor],
    exports: [MailerService],
})
export class MailerModule {}
