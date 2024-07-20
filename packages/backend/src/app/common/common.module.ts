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
import { HelpersModule } from "./helpers/helpers.module";
import { FieldsModule } from "./fields/fields.module";
import { FiltersModule } from "./filters/filters.module";
import { ClsModule } from "nestjs-cls";
import { CardTypesModule } from "./card-types/card.types.module";
import { MailerModule } from "./mailer/mailer.module";
import { ConditionalModule, ConfigModule, ConfigService } from "@nestjs/config";
import { FilesModule } from "./files/files.module";
import { AutomationsModule } from "./automations/automations.module";
import { BullModule } from "@nestjs/bull";

@Module({
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
            },
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get("TW_REDIS_HOST"),
                    port: configService.get("TW_REDIS_PORT"),
                },
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        CardsModule,
        WorkspacesModule,
        ProjectsModule,
        SpacesModule,
        ListsModule,
        UsersModule,
        ViewsModule,
        HelpersModule,
        FieldsModule,
        FiltersModule,
        CardTypesModule,
        // Only add this module if TW_MAIL_ENABLE env variable is true
        ConditionalModule.registerWhen(MailerModule, "TW_MAIL_ENABLE"),
        FilesModule,
        AutomationsModule,
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
