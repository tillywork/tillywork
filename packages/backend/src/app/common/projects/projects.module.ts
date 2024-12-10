import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { Project } from "./project.entity";
import { ProjectUsersModule } from "./project-users/project.users.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Project]),
        ProjectUsersModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule {}
