import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Logger,
} from "@nestjs/common";
import { UserFindAllResult, UsersService } from "./users.service";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create.user.dto";
import { UpdateUserDto } from "./dto/update.user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("users")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "users",
    version: "1",
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    private logger = new Logger("UsersController");

    //TODO disable this action for non-admins
    @Get()
    findAll(): Promise<UserFindAllResult> {
        return this.usersService.findAll({});
    }

    //TODO non-admins only able to retrieve their own user
    @Get(":id")
    findOne(@Param("id") id: string): Promise<User> {
        return this.usersService.findOne(+id);
    }

    //TODO disable for non-admins
    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    //TODO non-admins only able to update their own user
    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return this.usersService.update(+id, updateUserDto);
    }

    //TODO non-admins only able to delete their own user
    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.usersService.remove(+id);
    }
}
