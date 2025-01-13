import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
} from "@nestjs/common";
import { UserFindAllResult, UsersService } from "./users.service";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create.user.dto";
import { UpdateUserDto } from "./dto/update.user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserGuard } from "./user.guard";

@ApiBearerAuth()
@ApiTags("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
    path: "users",
    version: "1",
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(["admin"])
    findAll(): Promise<UserFindAllResult> {
        return this.usersService.findAll({});
    }

    @Get(":id")
    @UseGuards(UserGuard)
    findOne(@Param("id") id: number): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles(["admin"])
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Put(":id")
    @UseGuards(UserGuard)
    update(
        @Param("id") id: number,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(":id")
    @UseGuards(UserGuard)
    remove(@Param("id") id: number): Promise<void> {
        return this.usersService.remove(+id);
    }
}
