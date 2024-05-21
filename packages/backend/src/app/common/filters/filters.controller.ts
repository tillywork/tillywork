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
import { FilterFindAllResult, FiltersService } from "./filters.service";
import { Filter } from "./filter.entity";
import { CreateFilterDto } from "./dto/create.filter.dto";
import { UpdateFilterDto } from "./dto/update.filter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("filters")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "filters",
    version: "1",
})
export class FiltersController {
    constructor(private readonly filtersService: FiltersService) {}

    @Get()
    findAll(): Promise<FilterFindAllResult> {
        return this.filtersService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Filter> {
        return this.filtersService.findOne(+id);
    }

    @Post()
    create(@Body() createFilterDto: CreateFilterDto): Promise<Filter> {
        return this.filtersService.create({
            ...createFilterDto,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateFilterDto
    ): Promise<Filter> {
        return this.filtersService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.filtersService.remove(+id);
    }
}
