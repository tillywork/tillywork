import { Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app/app.module";
import { Connection } from "typeorm";
import { seedUserData } from "./seeders/user.seeder";

async function bootstrap() {
    const port = process.env.PORT || 3000;
    const environment = process.env.NODE_ENV || "development";
    const logger = new Logger("main.ts");
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter()
    );

    // Enable API URI Versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Allow Cross Origin Requests
    app.enableCors({
        origin: "*",
    });

    await app.listen(port, "0.0.0.0");

    if (environment === "development") {
        const connection = app.get(Connection);
        await seedUserData(connection);
    }

    logger.log(
        `🚀 FalconDrive Backend is running on: http://localhost:${port}`
    );
    logger.log(`Environment: ${environment}`);
}

bootstrap();
