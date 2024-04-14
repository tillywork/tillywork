import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { LoggingInterceptor } from "../common/logger/logging.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CardsModule } from "./cards/cards.module";
import { ProjectsModule } from "./projects/projects.module";
import { SpacesModule } from "./spaces/spaces.module";
import { UsersModule } from "./users/users.module";
import { ViewsModule } from "./views/views.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { ListsModule } from "./lists/lists.module";

@Module({
    imports: [
        AuthModule,
        CardsModule,
        WorkspacesModule,
        ProjectsModule,
        SpacesModule,
        ListsModule,
        UsersModule,
        ViewsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
    exports: [],
})
export class CommonModule {}
