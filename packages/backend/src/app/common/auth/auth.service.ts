import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/user.entity";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(user: User): Promise<string> {
        const { password, ...userWithoutPassword } = user;
        const payload = { ...userWithoutPassword, sub: user.id };
        return this.jwtService.sign(payload);
    }

    async validatePassword(
        password: string,
        savedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, savedPassword);
    }

    async validateUser(
        email: string,
        password: string
    ): Promise<Omit<User, "password"> | null> {
        try {
            const user = await this.usersService.findOneByEmail(email);
            if (
                user &&
                (await this.validatePassword(password, user.password))
            ) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...result } = user;
                return result;
            }

            return null;
        } catch (error) {
            return null;
        }
    }
}
