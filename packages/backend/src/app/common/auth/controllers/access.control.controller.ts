import { Controller, Get, UseGuards } from "@nestjs/common";
import { AccessControlService } from "../services/access.control.service";
import { JwtAuthGuard } from "../guards/jwt.auth.guard";
import { CurrentUser } from "../decorators/current.user.decorator";
import { User } from "../../users/user.entity";

@UseGuards(JwtAuthGuard)
@Controller({
    version: "1",
    path: "access-control",
})
export class AccessControlController {
    constructor(private readonly accessControlService: AccessControlService) {}

    @Get("me")
    async getMyPermissions(@CurrentUser() user: User) {
        const userId = user.id;
        return this.accessControlService.findAllForUser(userId);
    }
}
