import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { LocalAuthGuard } from "./guards/local.auth.guard";
import { JwtAuthGuard } from "./guards/jwt.auth.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { ConfigModule } from "@nestjs/config";
import { ProjectsModule } from "../projects/projects.module";
import { ProjectUsersModule } from "../projects/project-users/project.users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessControl } from "./entities/access.control.entity";
import { AccessControlService } from "./services/access.control.service";
import { AccessStrategyFactory } from "./factories/access.strategy.factory";
import { WorkspaceAccessStrategy } from "./strategies/access.strategy/workspace.access.strategy";
import { SpaceAccessStrategy } from "./strategies/access.strategy/space.access.strategy";
import { ListAccessStrategy } from "./strategies/access.strategy/list.access.strategy";

@Module({
    imports: [
        forwardRef(() => UsersModule), // Use forwardRef to avoid circular dependency,
        JwtModule.register({
            secret: process.env.TW_SECRET_KEY,
            signOptions: { expiresIn: "7d" },
        }),
        ConfigModule.forRoot(),
        forwardRef(() => ProjectsModule),
        forwardRef(() => ProjectUsersModule),
        TypeOrmModule.forFeature([AccessControl]),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        AccessControlService,
        AccessStrategyFactory,
        WorkspaceAccessStrategy,
        SpaceAccessStrategy,
        ListAccessStrategy,
    ],
    controllers: [AuthController],
    exports: [AuthService, AccessControlService],
})
export class AuthModule {}
