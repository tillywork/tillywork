import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app/app.module";
import { Connection } from "typeorm";
import { seedUserData } from "./seeders/user.seeder";
import { seedCardsData } from "./seeders/card.seeder";

async function bootstrap() {
    const port = process.env.PORT || 3000;
    const environment = process.env.NODE_ENV || "development";
    const logger = new Logger("main.ts");
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
        {
            cors: true,
        }
    );

    // Enable API URI Versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Add Global Validation Pipe
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(port, "0.0.0.0");

    if (environment === "development") {
        const connection = app.get(Connection);
        await seedUserData(connection);
        // await seedCardsData(connection);
    }

    logger.log(`🚀 tillywork API is running on: http://localhost:${port}`);
    logger.log(`Environment: ${environment}`);
}

bootstrap();
