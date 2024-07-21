import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { Project } from "./project.entity";
import { ProjectUsersModule } from "./project-users/project.users.module";
import { ProjectUserActivitiesModule } from "./project-user-activities/project.user.activities.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Project]),
        ProjectUsersModule,
        ProjectUserActivitiesModule,
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule {}
