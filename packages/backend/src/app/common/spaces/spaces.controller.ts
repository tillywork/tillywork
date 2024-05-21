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
import { SpacesService } from "./spaces.service";
import { Space } from "./space.entity";
import { CreateSpaceDto } from "./dto/create.space.dto";
import { UpdateSpaceDto } from "./dto/update.space.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("spaces")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "spaces",
    version: "1",
})
export class SpacesController {
    constructor(private readonly spacesService: SpacesService) {}

    @Get()
    findAll(@Query() query: { workspaceId: number }): Promise<Space[]> {
        const { workspaceId } = query;
        return this.spacesService.findAllBy({
            where: {
                workspaceId,
            },
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Space> {
        return this.spacesService.findOne(+id);
    }

    @Post()
    create(@Body() createSpaceDto: CreateSpaceDto): Promise<Space> {
        return this.spacesService.create(createSpaceDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateSpaceDto: UpdateSpaceDto
    ): Promise<Space> {
        return this.spacesService.update(+id, updateSpaceDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.spacesService.remove(+id);
    }
}
