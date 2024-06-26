import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "./common/common.module";
import typeorm from "../config/typeorm";
import { validationSchema } from "../config/validation.schema";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [typeorm],
            validationSchema,
        }),
        TypeOrmModule.forRootAsync({
            useFactory: async (configService: ConfigService) =>
                configService.get("typeorm"),
            inject: [ConfigService],
            imports: [ConfigModule],
        }),
        CommonModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {}
