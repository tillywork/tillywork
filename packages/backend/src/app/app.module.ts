import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CommonModule } from "./common/common.module";
import { CRMModule } from "./crm/crm.module";
import { TypeOrmLoggerContainer } from "./common/logger/typeorm.logger.container";

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
                logger: configService.get('FD_ENABLE_QUERY_LOGGING') !== 'false' ? TypeOrmLoggerContainer.ForConnection(true) : undefined,
            }),
            inject: [ConfigService],
        }),
        CommonModule,
        CRMModule,
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [],
})
export class AppModule {}
