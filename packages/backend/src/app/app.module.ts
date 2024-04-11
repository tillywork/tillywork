import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ContactsModule } from "./contacts/contacts.module";
import { AuthModule } from "./auth/auth.module";
import { LoggingInterceptor } from "./logger/logging.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ProjectsModule } from "./projects/projects.module";
import { NotesModule } from "./notes/notes.module";
import { SpacesModule } from "./spaces/spaces.module";
import { ViewsModule } from "./views/views.module";
import { CardsModule } from "./cards/cards.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("FD_DB_HOST"),
                port: configService.get("FD_DB_PORT"),
                username: configService.get("FD_DB_USERNAME"),
                password: configService.get("FD_DB_PASSWORD"),
                database: configService.get("FD_DB_NAME"),
                entities: [__dirname + "/**/*.entity{.ts,.js}"],
                autoLoadEntities: true,
                synchronize: true, // use only in development, in production should be handled by migrations
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        ProjectsModule,
        SpacesModule,
        ViewsModule,
        CardsModule,
        ContactsModule,
        NotesModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
    exports: [],
})
export class AppModule {}
