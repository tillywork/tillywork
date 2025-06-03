import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./controllers/auth.controller";
import { JwtModule } from "@nestjs/jwt";
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
import { AclContext } from "./context/acl.context";
import { NotificationPreferenceModule } from "../notifications/notification-preference/notification.preference.module";
import { AccessControlController } from "./controllers/access.control.controller";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: process.env.TW_SECRET_KEY,
            signOptions: { expiresIn: "7d" },
            global: true,
        }),
        ConfigModule.forRoot(),
        forwardRef(() => ProjectsModule),
        forwardRef(() => ProjectUsersModule),
        TypeOrmModule.forFeature([AccessControl]),
        NotificationPreferenceModule,
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
        AclContext,
    ],
    controllers: [AuthController, AccessControlController],
    exports: [AuthService, AccessControlService, AclContext, JwtModule],
})
export class AuthModule {}
