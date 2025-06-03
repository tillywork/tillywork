import { Body, Controller, Param, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService, RegisterResponse } from "../services/auth.service";
import { LocalAuthGuard } from "../guards/local.auth.guard";
import { JwtAuthGuard } from "../guards/jwt.auth.guard";
import { CreateUserDto } from "../../users/dto/create.user.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current.user.decorator";
import { User } from "../../users/user.entity";

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
    async login(@CurrentUser() user): Promise<LoginResponse> {
        const accessToken = await this.authService.login({
            user,
        });
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

    @UseGuards(JwtAuthGuard)
    @Post("invite/:inviteCode/join")
    async joinInvitation(
        @Param("inviteCode") inviteCode: string,
        @CurrentUser() user: User,
        @Res({ passthrough: true }) res
    ): Promise<RegisterResponse> {
        const response = await this.authService.joinInvitation({
            inviteCode,
            userId: user.id,
        });

        if (response["error"]) {
            res.status(200);
        }

        return response;
    }
}

type LoginResponse = {
    accessToken: string;
};
