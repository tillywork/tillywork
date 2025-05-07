import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketAuthService } from "./socket-auth.service";
import { TillyLogger } from "../logger/tilly.logger";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new TillyLogger("SocketGateway");

    constructor(private readonly socketAuthService: SocketAuthService) {}

    async handleConnection(client: Socket) {
        const user = await this.socketAuthService.authenticateSocket(client);
        if (!user) {
            client.disconnect();
            return;
        }

        client.data.user = user;

        client.join(String(user.id));
        this.logger.log(`User connected: ${user.id} (socket ${client.id})`);
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.user?.id;
        if (userId) {
            this.logger.log(
                `User disconnected: ${userId} (socket ${client.id})`
            );
        }
    }

    @SubscribeMessage("room:join")
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { room: string }
    ) {
        const { room } = payload;

        client.join(room);

        this.logger.log(`User ${client.data.user.id} joined room ${room}`);
    }
}
