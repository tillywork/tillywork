import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { UsersService } from "./users.service";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(private usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userEntity = await this.usersService.findOne(user.id);

        const params = request.params;
        const idParam = params.id ? Number(params.id) : null;

        return userEntity.roles.includes("admin") || userEntity.id === idParam;
    }
}
