import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { AuthModule } from "../auth/auth.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserClsInterceptor } from "./user.cls.interceptor";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule), // Use forwardRef to avoid circular dependency,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: APP_INTERCEPTOR,
            useClass: UserClsInterceptor,
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
