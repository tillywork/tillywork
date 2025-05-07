import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { TillyLogger } from "../logger/tilly.logger";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;
    private logger = new TillyLogger("NotificationsGateway");

    sendNotificationToUser(userId: number, notification: any) {
        this.server.to(String(userId)).emit("notification", notification);
    }
}
