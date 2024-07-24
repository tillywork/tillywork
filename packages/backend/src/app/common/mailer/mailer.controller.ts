import { Controller, Post, Body, UseGuards, Logger } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { MailerService } from "./mailer.service";
import { CardType } from "../card-types/card.type.entity";
import { User } from "../users/user.entity";

export type SendMentionNotificationParams = {
    userId: number;
    mentionedBy: User;
    cardType: CardType;
    route: string;
};

@ApiBearerAuth()
@ApiTags("mailer")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "mailer",
    version: "1",
})
export class MailerController {
    private readonly logger = new Logger("MailerController");
    constructor(private readonly mailerService: MailerService) {}

    @Post("mention")
    sendMentionNotificationEmail(
        @Body() mailDto: SendMentionNotificationParams
    ) {
        this.mailerService.sendMentionNotificationEmail(mailDto);
    }
}
