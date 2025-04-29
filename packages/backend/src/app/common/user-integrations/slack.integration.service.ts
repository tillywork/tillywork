import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IntegrationType } from "@tillywork/shared";
import axios from "axios";
import { UserIntegrationService } from "./user.integration.service";

@Injectable()
export class SlackIntegrationService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userIntegrationService: UserIntegrationService
    ) {}

    getAuthUrl(userId: number) {
        const state = Buffer.from(
            JSON.stringify({ userId, integration: IntegrationType.SLACK })
        ).toString("base64");
        const params = new URLSearchParams({
            client_id: this.configService.get<string>("TW_SLACK_CLIENT_ID"),
            scope: "chat:write,users:read,im:write",
            user_scope: "",
            redirect_uri: this.configService.get<string>(
                "TW_SLACK_REDIRECT_URI"
            ),
            state,
        });
        return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
    }

    async handleOAuthCallback(code: string, state: string) {
        const decoded = JSON.parse(Buffer.from(state, "base64").toString());
        const { userId } = decoded;

        const tokenRes = await axios.post(
            "https://slack.com/api/oauth.v2.access",
            null,
            {
                params: {
                    code,
                    client_id:
                        this.configService.get<string>("TW_SLACK_CLIENT_ID"),
                    client_secret: this.configService.get<string>(
                        "TW_SLACK_CLIENT_SECRET"
                    ),
                    redirect_uri: this.configService.get<string>(
                        "TW_SLACK_REDIRECT_URI"
                    ),
                },
            }
        );
        const { authed_user, access_token } = tokenRes.data;
        await this.userIntegrationService.upsertForUser(Number(userId), {
            type: IntegrationType.SLACK,
            config: {
                access_token,
                slack_user_id: authed_user.id,
            },
        });
    }

    async sendDM({
        userId,
        message,
        title,
    }: {
        userId: number;
        message: string;
        title: string;
    }) {
        // 1. Get the user's Slack integration
        const integration = await this.userIntegrationService.findOne({
            userId,
            type: IntegrationType.SLACK,
        });

        if (
            !integration ||
            !integration.config?.access_token ||
            !integration.config?.slack_user_id
        ) {
            throw new Error(
                "User does not have a Slack integration configured"
            );
        }

        const { access_token, slack_user_id } = integration.config;

        // 2. Open a DM channel with the user
        const imRes = await axios.post(
            "https://slack.com/api/conversations.open",
            { users: slack_user_id },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!imRes.data.ok) {
            throw new Error(
                "Failed to open Slack DM channel: " + imRes.data.error
            );
        }
        const channelId = imRes.data.channel.id;

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `🔔 ${title}`,
                },
            },
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${message}*`,
                },
            },
        ];

        const chatRes = await axios.post(
            "https://slack.com/api/chat.postMessage",
            {
                channel: channelId,
                blocks,
                text: `New notification: ${title} - ${message}`, // fallback
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!chatRes.data.ok) {
            throw new Error("Failed to send Slack DM: " + chatRes.data.error);
        }
        return chatRes.data;
    }
}
