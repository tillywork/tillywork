import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Query,
} from "@nestjs/common";
import { FieldsService, FindAllParams } from "./fields.service";
import { Field } from "./field.entity";
import { CreateFieldDto } from "./dto/create.field.dto";
import { UpdateFieldDto } from "./dto/update.field.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";

@ApiBearerAuth()
@ApiTags("fields")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "fields",
    version: "1",
})
export class FieldsController {
    constructor(private readonly fieldsService: FieldsService) {}

    @Get()
    findAll(@Query() query: FindAllParams): Promise<Field[]> {
        return this.fieldsService.findAll(query);
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<Field> {
        return this.fieldsService.findOne(id);
    }

    @Post()
    create(
        @Body() createFieldDto: CreateFieldDto,
        @CurrentUser() user: User
    ): Promise<Field> {
        return this.fieldsService.create({
            ...createFieldDto,
            createdByType: "user",
            createdBy: user,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateFieldDto: UpdateFieldDto
    ): Promise<Field> {
        return this.fieldsService.update(+id, updateFieldDto);
    }

    @Delete(":id")
    remove(@Param("id") id: number): Promise<void> {
        return this.fieldsService.remove(+id);
    }
}
