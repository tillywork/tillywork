import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Request,
} from "@nestjs/common";
import { PropFindAllResult, PropsService } from "./props.service";
import { Prop } from "./prop.entity";
import { CreatePropDto } from "./dto/create.prop.dto";
import { UpdatePropDto } from "./dto/update.prop.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("props")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "props",
    version: "1",
})
export class PropsController {
    constructor(private readonly propsService: PropsService) {}

    @Get()
    findAll(@Request() req): Promise<PropFindAllResult> {
        const { user } = req;
        return this.propsService.findAll({
            where: {
                ownerId: user.id,
            },
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Prop> {
        return this.propsService.findOne(+id);
    }

    @Post()
    create(@Body() createPropDto: CreatePropDto): Promise<Prop> {
        return this.propsService.create({
            ...createPropDto,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updatePropDto: UpdatePropDto
    ): Promise<Prop> {
        return this.propsService.update(+id, updatePropDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.propsService.remove(+id);
    }
}
