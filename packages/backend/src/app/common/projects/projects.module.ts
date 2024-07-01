import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { Project } from "./project.entity";
import { ProjectUsersModule } from "./project-users/project.users.module";
import { ProjectInviteCodesModule } from "./project-invite-codes/project.invite.codes.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Project]),
        ProjectUsersModule,
        ProjectInviteCodesModule,
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule {}
