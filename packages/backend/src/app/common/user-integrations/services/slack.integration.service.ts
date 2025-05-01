import { BadRequestException, Injectable } from "@nestjs/common";
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
            scope: "chat:write,users:read,im:write,channels:read,groups:read",
            user_scope: "",
            redirect_uri: this.configService.get<string>("TW_REDIRECT_URL"),
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
                    redirect_uri:
                        this.configService.get<string>("TW_REDIRECT_URL"),
                },
            }
        );
        const { authed_user, access_token: accessToken } = tokenRes.data;
        await this.userIntegrationService.upsertForUser(Number(userId), {
            type: IntegrationType.SLACK,
            config: {
                accessToken,
                slackUserId: authed_user.id,
            },
        });
    }

    async sendDM({
        userId,
        message,
        title,
        url,
    }: {
        userId: number;
        message: string;
        title: string;
        url: string;
    }) {
        const integration = await this.userIntegrationService.findOne({
            userId,
            type: IntegrationType.SLACK,
        });

        if (
            !integration ||
            !integration.config?.accessToken ||
            !integration.config?.slackUserId
        ) {
            throw new Error(
                "[SlackIntegrationService#sendDM] User does not have a Slack integration configured"
            );
        }

        const { accessToken, slackUserId } = integration.config;

        const conversationRes = await this.openConversation({
            slackUserId,
            accessToken,
        });

        if (!conversationRes.ok) {
            throw new Error(
                "[SlackIntegrationService#sendDM] Failed to open Slack DM channel: " +
                    conversationRes.error
            );
        }

        const channelId = conversationRes.channel.id;

        const blocks = this.createNotificationBlocks({ title, message, url });

        const chatRes = await this.sendMessage({
            channelId,
            blocks,
            text: `New notification: ${title} - ${message}`,
            accessToken,
        });

        if (!chatRes.data.ok) {
            throw new Error(
                "[SlackIntegrationService#sendDM] Failed to send Slack DM: " +
                    chatRes.data.error
            );
        }
        return chatRes.data;
    }

    async sendChannelMessage({
        userId,
        channelId,
        message,
        title,
        url,
    }: {
        userId: number;
        channelId: string;
        message: string;
        title: string;
        url: string;
    }) {
        // 1. Get the user's Slack integration
        const integration = await this.userIntegrationService.findOne({
            userId,
            type: IntegrationType.SLACK,
        });

        if (!integration || !integration.config?.accessToken) {
            throw new BadRequestException(
                "[SlackIntegrationService#sendChannelMessage] User does not have a Slack integration configured"
            );
        }

        const { accessToken } = integration.config;

        const blocks = this.createNotificationBlocks({ title, message, url });

        let chatRes;
        try {
            chatRes = await this.sendMessage({
                channelId,
                blocks,
                text: `New notification: ${title} - ${message}`,
                accessToken,
            });
        } catch (err) {
            throw new Error(
                "[SlackIntegrationService#sendChannelMessage] Failed to send message: " +
                    chatRes.data.error
            );
        }

        if (!chatRes.data.ok && chatRes.data.error === "not_in_channel") {
            await this.joinChannel({ channelId, accessToken });
            chatRes = await this.sendMessage({
                channelId,
                blocks,
                text: `New notification: ${title} - ${message}`,
                accessToken,
            });
        }

        if (!chatRes.data.ok) {
            throw new Error(
                "[SlackIntegrationService#sendChannelMessage] Failed to send message: " +
                    chatRes.data.error
            );
        }

        return chatRes.data;
    }

    async listChannels(userId: number) {
        const integration = await this.userIntegrationService.findOne({
            userId,
            type: IntegrationType.SLACK,
        });

        if (!integration?.config?.accessToken) {
            throw new BadRequestException(
                "User has not configured their Slack connection"
            );
        }

        const { data: channelsData } = await axios.get(
            "https://slack.com/api/conversations.list",
            {
                headers: {
                    Authorization: `Bearer ${integration.config.accessToken}`,
                },
                params: { types: "public_channel,private_channel" },
            }
        );

        if (!channelsData.ok) throw new Error(channelsData.error);

        return channelsData.channels.map((c: any) => ({
            id: c.id,
            name: c.name,
        }));
    }

    async joinChannel({
        channelId,
        accessToken,
    }: {
        channelId: string;
        accessToken;
    }) {
        return axios.post(
            "https://slack.com/api/conversations.join",
            { channel: channelId },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
    }

    async sendMessage({
        channelId,
        blocks,
        text,
        accessToken,
    }: {
        channelId: string;
        blocks;
        text: string;
        accessToken: string;
    }) {
        return axios.post(
            "https://slack.com/api/chat.postMessage",
            {
                channel: channelId,
                blocks,
                text,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
    }

    async openConversation({
        slackUserId,
        accessToken,
    }: {
        slackUserId: string;
        accessToken: string;
    }) {
        const { data } = await axios.post(
            "https://slack.com/api/conversations.open",
            { users: slackUserId },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!data.ok) {
            throw new Error(
                "[SlackIntegrationService#sendDM] Failed to open Slack DM channel: " +
                    data.error
            );
        }

        return data;
    }

    createNotificationBlocks({
        title,
        url,
        message,
    }: {
        title: string;
        url: string;
        message: string;
    }) {
        const blocks = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*<${url}|${title}>*`,
                },
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: message,
                    },
                ],
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "View Task",
                            emoji: true,
                        },
                        url,
                        style: "primary",
                    },
                ],
            },
        ];

        return blocks;
    }
}
