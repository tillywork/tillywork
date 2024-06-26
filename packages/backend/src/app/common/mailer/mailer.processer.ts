import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { MailerService } from "./mailer.service";
import { Logger } from "@nestjs/common";

@Processor("email")
export class MailerProcessor {
    private readonly logger = new Logger("MailerProcessor");
    constructor(private readonly mailerService: MailerService) {}

    @Process()
    async handleEmailJob(job: Job) {
        this.logger.debug("Processing job in queue");
        this.logger.debug({ job });
        await this.mailerService.sendMail(job.data);
    }
}
