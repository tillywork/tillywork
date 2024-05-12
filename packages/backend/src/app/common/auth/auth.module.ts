import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { LocalAuthGuard } from "./guards/local.auth.guard";
import { JwtAuthGuard } from "./guards/jwt.auth.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        forwardRef(() => UsersModule), // Use forwardRef to avoid circular dependency,
        JwtModule.register({
            secret: process.env.TW_SECRET_KEY,
            signOptions: { expiresIn: "7d" },
        }),
        ConfigModule.forRoot(),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        LocalAuthGuard,
        JwtAuthGuard,
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
