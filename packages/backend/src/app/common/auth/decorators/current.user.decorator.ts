import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../users/user.entity";

export const CurrentUser = createParamDecorator(
    (data: keyof User | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // If no specific property is requested, return the entire user object
        if (!data) return user;

        // If a specific property is requested, return just that property
        return user?.[data];
    }
);
