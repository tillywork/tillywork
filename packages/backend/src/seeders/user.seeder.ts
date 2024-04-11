import { Connection } from "typeorm";
import { UsersService } from "../app/users/users.service";
import { User } from "../app/users/user.entity";
import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";

const logger = new Logger("UserSeeder");

export async function seedUserData(connection: Connection): Promise<void> {
    const usersService = new UsersService(connection.getRepository(User));
    const email = "dev@fd.com";
    const password = "12345678";

    logger.log("Seeding user data...");
    logger.log("Email: dev@fd.com", "Password: 12345678");
    // Check if test user already exists or not
    const testUser = await usersService.findOneByEmail(email);
    if (!testUser) {
        await usersService.create({
            email,
            password,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        });

        logger.log("Test user created successfully...");
    } else {
        logger.log("Test user already exists, skipping...");
    }
}
