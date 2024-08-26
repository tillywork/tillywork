import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bull";
import nodemailer, { Transporter } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { Repository } from "typeorm";
import { Email } from "./email.entity";
import { UsersService } from "../users/users.service";
import { SendMentionNotificationParams } from "./mailer.controller";
import { EmailStatus } from "./types";

export type EmailOptions = MailOptions & {
    id: string;
};

@Injectable()
export class MailerService {
    private transporter: Transporter;
    private readonly logger = new Logger("MailerService");
    private environment: string;

    constructor(
        private configService: ConfigService,
        @InjectQueue("email") private emailQueue: Queue,
        @InjectRepository(Email) private emailRepository: Repository<Email>,
        private usersService: UsersService
    ) {
        this.environment = this.configService.get("NODE_ENV");
        const enableMail = this.configService.get("TW_MAIL_ENABLE");

        if (!enableMail) {
            this.logger.debug(
                "Mailer disabled by environment variables. Set TW_MAIL_ENABLE=true to enable mailing."
            );
            return;
        }

        if (this.environment === "development") {
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
                this.transporter = nodemailer.createTransport(
                    {
                        host: account.smtp.host,
                        port: account.smtp.port,
                        secure: account.smtp.secure,
                        auth: {
                            user: account.user,
                            pass: account.pass,
                        },
                    },
                    {
                        from: `tillywork <${configService.get(
                            "TW_MAIL_USER"
                        )}>`,
                    }
                );
            });
        } else {
            this.transporter = nodemailer.createTransport(
                {
                    host: configService.getOrThrow("TW_MAIL_HOST"),
                    port: configService.getOrThrow("TW_MAIL_PORT"),
                    secure: configService.getOrThrow("TW_MAIL_SECURE"),
                    auth: {
                        user: configService.getOrThrow("TW_MAIL_USER"),
                        pass: configService.getOrThrow("TW_MAIL_PASS"),
                    },
                },
                {
                    from: `tillywork <${configService.get("TW_MAIL_USER")}>`,
                }
            );

            this.logger.debug("Mailer initialized.");
        }
    }

    async sendEmail(emailOptions: MailOptions) {
        const email = await this.createEmailEntity(emailOptions);

        await this.addEmailToQueue({
            ...emailOptions,
            id: email.id,
        });

        return email;
    }

    async processEmail(emailOptions: EmailOptions) {
        const trackingPixel = `<img src="${this.configService.get(
            "TW_VITE_API_URL"
        )}/mailer/tracking/${emailOptions.id}" width="1" height="1" />`;

        if (emailOptions.html) {
            emailOptions.html += trackingPixel;
        }

        const emailResult = await this.transporter.sendMail(emailOptions);
        await this.updateStatus({
            id: emailOptions.id,
            newStatus: EmailStatus.SUCCESS,
        });

        if (this.environment === "development") {
            const previewUrl = nodemailer.getTestMessageUrl(emailResult);
            this.logger.debug({ previewUrl });
        }

        return emailResult;
    }

    async addEmailToQueue(emailOptions: EmailOptions) {
        await this.emailQueue.add(emailOptions);
        await this.updateStatus({
            id: emailOptions.id,
            newStatus: EmailStatus.QUEUED,
        });
    }

    private async createEmailEntity(emailOptions: MailOptions): Promise<Email> {
        const email = new Email();
        email.to = emailOptions.to as string;
        email.subject = emailOptions.subject as string;
        email.body =
            (emailOptions.text as string) || (emailOptions.html as string);
        email.status = EmailStatus.PENDING;

        await this.emailRepository.save(email);
        return email;
    }

    async findOne(id: string) {
        return this.emailRepository.findOne({
            where: {
                id,
            },
        });
    }

    async updateStatus({
        id,
        newStatus,
    }: {
        id: string;
        newStatus: EmailStatus;
    }) {
        const email = await this.findOne(id);

        if (!email) {
            this.logger.error(`Email with id ${id} not found`);
            return;
        }

        email.status = newStatus;
        await this.emailRepository.save(email);

        return email;
    }

    async sendMentionNotificationEmail({
        userId,
        mentionedBy,
        cardType,
        route,
    }: SendMentionNotificationParams) {
        const to = await this.usersService.findOne(userId);
        //TODO email templates
        return this.sendEmail({
            to: to.email,
            subject: `${
                mentionedBy.firstName
            } mentioned you in a ${cardType.name.toLowerCase()}`,
            html: `
            <p>Hello ${to.firstName},</p>
            <p>${mentionedBy.firstName} ${
                mentionedBy.lastName
            } mentioned you in a
            <a href="${route}">${cardType.name.toLowerCase()}</a>.
            </p>
            `,
        });
    }

    async trackEmailOpen(id: string) {
        const email = await this.findOne(id);

        if (!email) {
            this.logger.error(`Email with id ${id} not found`);
            return;
        }

        email.openCount = (email.openCount || 0) + 1;
        email.openTimes = email.openTimes || [];
        email.openTimes.push(new Date().toISOString());

        await this.emailRepository.save(email);

        return email;
    }
}
