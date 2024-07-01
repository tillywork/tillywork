import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { User } from "../../users/user.entity";
import { Project } from "../../projects/project.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: "email" });
    }

    async validate(
        email: string,
        password: string
    ): Promise<
        Omit<User, "password"> & {
            project: Project;
        }
    > {
        const { user, project } = await this.authService.validateUser(
            email,
            password
        );
        if (!user) {
            throw new UnauthorizedException();
        }

        return { ...user, project };
    }
}
