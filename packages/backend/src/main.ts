import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app/app.module";
import { Connection } from "typeorm";
import { seedUserData } from "./seeders/user.seeder";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import metadata from "./metadata";
import { FastifyAdapter as BullFastifyAdapter } from "@bull-board/fastify";
import { getQueueToken } from "@nestjs/bull";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ConfigService } from "@nestjs/config";
import { contentParser } from "fastify-multer";

async function bootstrap() {
    const logger = new Logger("main.ts");
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
        {
            cors: true,
        }
    );
    const configService = app.get(ConfigService);
    const port = configService.get("PORT");
    const environment = configService.get("NODE_ENV");

    // Enable API URI Versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Add Global Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        })
    );

    app.register(contentParser);

    await SwaggerModule.loadPluginMetadata(metadata);
    const config = new DocumentBuilder()
        .setTitle("tillywork API")
        .setVersion("1.0")
        .addBearerAuth()
        .addBasicAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    if (configService.get("TW_MAIL_ENABLE")) {
        const serverAdapter = new BullFastifyAdapter();
        serverAdapter.setBasePath("/bullmq");

        const emailQueue = app.get(getQueueToken("email"));
        createBullBoard({
            queues: [new BullAdapter(emailQueue)],
            serverAdapter,
        });

        app.getHttpAdapter()
            .getInstance()
            .register(serverAdapter.registerPlugin(), {
                basePath: "/bullmq",
                prefix: "/bullmq",
            });
    }

    await app.listen(port, "0.0.0.0");

    if (environment === "development") {
        const connection = app.get(Connection);
        await seedUserData(connection);
    }

    logger.log(`🚀 tillywork API is running on: http://localhost:${port}`);
    logger.log(`Environment: ${environment}`);
}

bootstrap();
