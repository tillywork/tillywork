import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { MailerService } from "./mailer.service";
import { Logger } from "@nestjs/common";
import { EmailStatus } from "./types";

@Processor("email")
export class MailerProcessor {
    private readonly logger = new Logger("MailerProcessor");
    constructor(private readonly mailerService: MailerService) {}

    @Process()
    async handleEmailJob(job: Job) {
        const { emailId } = job.data;

        this.mailerService.updateStatus({
            id: emailId,
            newStatus: EmailStatus.SENDING,
        });

        this.logger.debug("Processing job in queue");
        this.logger.debug({ id: job.id, data: job.data });

        try {
            return await this.mailerService.processEmail(job.data);
        } catch {
            this.mailerService.updateStatus({
                id: emailId,
                newStatus: EmailStatus.FAILED,
            });
        }
    }
}
