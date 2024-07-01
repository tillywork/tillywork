import {
    Body,
    Controller,
    Logger,
    Post,
    Request,
    Res,
    UseGuards,
} from "@nestjs/common";
import { AuthService, RegisterResponse } from "./auth.service";
import { LocalAuthGuard } from "./guards/local.auth.guard";
import { CreateUserDto } from "../users/dto/create.user.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller({
    path: "auth",
    version: "1",
})
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Logs the user in with email and password
     */
    @UseGuards(LocalAuthGuard)
    @ApiBody({
        schema: {
            properties: {
                email: {
                    type: "string",
                },
                password: {
                    type: "string",
                },
            },
        },
    })
    @Post("login")
    async login(@Request() req): Promise<LoginResponse> {
        const accessToken = await this.authService.login(req.user);
        Logger.debug({ user: req.user });
        return { accessToken };
    }

    @Post("register")
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res
    ): Promise<RegisterResponse> {
        const response = await this.authService.register(createUserDto);

        if (response["error"]) {
            res.status(200);
        }

        return response;
    }

    @Post("invite/:inviteCode")
    async registerWithInvite(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res
    ): Promise<RegisterResponse> {
        const response = await this.authService.registerWithInvite(
            createUserDto
        );

        if (response["error"]) {
            res.status(200);
        }

        return response;
    }
}

type LoginResponse = {
    accessToken: string;
};
