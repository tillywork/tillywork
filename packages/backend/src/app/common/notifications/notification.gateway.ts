import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { TillyLogger } from "../logger/tilly.logger";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;
    private logger = new TillyLogger("NotificationsGateway");

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        const token = client.handshake.auth?.token;
        if (!token) {
            client.disconnect();
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            client.data.user = payload;
        } catch (err) {
            client.disconnect();
            return;
        }

        const userId = client.data.user.id;
        client.join(String(userId));
        this.logger.log(`User connected: ${userId} (socket ${client.id})`);
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.user?.id;
        if (userId) {
            this.logger.log(
                `User disconnected: ${userId} (socket ${client.id})`
            );
        }
    }

    sendNotificationToUser(userId: number, notification: any) {
        this.server.to(String(userId)).emit("notification", notification);
    }
}
