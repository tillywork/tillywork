import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "./common/common.module";
import typeorm from "../config/typeorm";
import { validationSchema } from "../config/validation.schema";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TracingInterceptor } from "./common/interceptors/tracing.interceptor";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [typeorm],
            validationSchema,
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            useFactory: async (configService: ConfigService) =>
                configService.get("typeorm"),
            inject: [ConfigService],
            imports: [ConfigModule],
        }),
        EventEmitterModule.forRoot({
            wildcard: true,
        }),
        CommonModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: TracingInterceptor,
        },
    ],
    exports: [],
})
export class AppModule {}
