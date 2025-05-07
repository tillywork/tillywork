import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { TillyLogger } from "../logger/tilly.logger";
import { User } from "../users/user.entity";

@Injectable()
export class SocketAuthService {
    private logger = new TillyLogger("SocketAuthService");

    constructor(private readonly jwtService: JwtService) {}

    async authenticateSocket(socket: Socket): Promise<User | null> {
        const token = socket.handshake.auth?.token;

        if (!token) {
            this.logger.warn("No token provided for socket connection");
            return null;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            socket.data.user = payload;

            return payload;
        } catch (err) {
            this.logger.warn("Invalid token for socket connection");
            return null;
        }
    }
}
