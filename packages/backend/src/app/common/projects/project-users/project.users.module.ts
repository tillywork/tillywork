import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectUser } from "./project.user.entity";
import { ProjectUsersController } from "./project.users.controller";
import { ProjectUsersService } from "./project.users.service";

@Module({
    imports: [TypeOrmModule.forFeature([ProjectUser])],
    controllers: [ProjectUsersController],
    providers: [ProjectUsersService],
    exports: [ProjectUsersService],
})
export class ProjectUsersModule {}
