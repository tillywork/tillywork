import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { TillyLogger } from "../logger/tilly.logger";
import { Notification } from "./notification.entity";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;
    private logger = new TillyLogger("NotificationsGateway");

    sendNotificationToUser(userId: number, notification: Notification) {
        this.server.to(String(userId)).emit("notification", notification);
    }
}
