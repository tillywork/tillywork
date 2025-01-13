import {
    Controller,
    Post,
    Body,
    UseGuards,
    Logger,
    Get,
    Param,
    Res,
} from "@nestjs/common";
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

@ApiTags("mailer")
@Controller({
    path: "mailer",
    version: "1",
})
export class MailerController {
    private readonly logger = new Logger("MailerController");
    constructor(private readonly mailerService: MailerService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("mention")
    sendMentionNotificationEmail(
        @Body() mailDto: SendMentionNotificationParams
    ) {
        this.mailerService.sendMentionNotificationEmail(mailDto);
    }

    @Get("tracking/:emailId")
    async trackEmailOpen(@Param("emailId") emailId: string, @Res() res) {
        await this.mailerService.trackEmailOpen(emailId);

        const gifBase64 =
            "R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
        const gifBuffer = Buffer.from(gifBase64, "base64");

        return res.type("image/gif").send(gifBuffer);
    }
}
