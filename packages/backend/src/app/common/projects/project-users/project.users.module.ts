import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectUser } from "./project.user.entity";
import { ProjectUsersController } from "./project.users.controller";
import { ProjectUsersService } from "./project.users.service";
import { AuthModule } from "../../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProjectUser]),
        forwardRef(() => AuthModule),
    ],
    controllers: [ProjectUsersController],
    providers: [ProjectUsersService],
    exports: [ProjectUsersService],
})
export class ProjectUsersModule {}
