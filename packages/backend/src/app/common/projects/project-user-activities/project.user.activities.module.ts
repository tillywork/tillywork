import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectUserActivity } from "./project.user.activity.entity";
import { ProjectUserActivitiesController } from "./project.user.activitites.controller";
import { ProjectUserActivitiesService } from "./project.user.activities.service";
import { ProjectUsersModule } from "../project-users/project.users.module";
import { ListsModule } from "../../lists/lists.module";
import { CardsModule } from "../../cards/cards.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProjectUserActivity]),
        ProjectUsersModule,
        ListsModule,
        CardsModule,
    ],
    controllers: [ProjectUserActivitiesController],
    providers: [ProjectUserActivitiesService],
    exports: [ProjectUserActivitiesService],
})
export class ProjectUserActivitiesModule {}
