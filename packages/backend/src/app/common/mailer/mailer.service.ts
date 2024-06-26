import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import nodemailer, { Transporter } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

@Injectable()
export class MailerService {
    private transporter: Transporter;
    private readonly logger = new Logger("MailerService");

    constructor(
        private configService: ConfigService,
        @InjectQueue("email") private emailQueue: Queue
    ) {
        const environment = configService.get("NODE_ENV");
        const enableMail = configService.get("TW_MAIL_ENABLE");

        if (!enableMail) {
            this.logger.debug(
                "Mailer disabled by environment variables. Set TW_MAIL_ENABLE=true to enable mailing."
            );
            return;
        }

        if (environment === "development") {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    this.logger.error(
                        "Failed to create a test account.",
                        err.message
                    );

                    return;
                }

                this.logger.debug("Test mailer initialized.");

                // Create a SMTP transporter object
                this.transporter = nodemailer.createTransport({
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: {
                        user: account.user,
                        pass: account.pass,
                    },
                });
            });
        } else {
            this.transporter = nodemailer.createTransport({
                host: configService.getOrThrow("TW_MAIL_HOST"),
                port: configService.getOrThrow("TW_MAIL_PORT"),
                secure: configService.getOrThrow("TW_MAIL_SECURE"),
                auth: {
                    user: configService.getOrThrow("TW_MAIL_USER"),
                    pass: configService.getOrThrow("TW_MAIL_PASS"),
                },
            });

            this.logger.debug("Mailer initialized.");
        }
    }

    async sendMail(mailOptions: MailOptions) {
        await this.transporter.sendMail(mailOptions);
    }

    async addEmailToQueue(mailOptions: MailOptions) {
        await this.emailQueue.add(mailOptions);
    }
}
