import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { SocketAuthService } from "./socket-auth.service";

@Module({
    imports: [],
    controllers: [],
    providers: [SocketAuthService, SocketGateway],
    exports: [SocketAuthService],
})
export class SocketModule {}
