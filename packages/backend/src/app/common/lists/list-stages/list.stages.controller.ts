import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { ListStage } from "./list.stage.entity";
import { CreateListStageDto } from "./dto/create.list.stage.dto";
import { UpdateListStageDto } from "./dto/update.list.stage.dto";
import { ListStagesService } from "./list.stages.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("lists")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "lists/:listId/stages",
    version: "1",
})
export class ListStagesController {
    constructor(private readonly listStagesService: ListStagesService) {}

    @Get()
    findStages(@Param("listId") listId: number): Promise<ListStage[]> {
        return this.listStagesService.findAll({
            listId,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<ListStage> {
        return this.listStagesService.findOne(id);
    }

    @Post()
    create(
        @Param("listId") listId: number,
        @Body() createListDto: Omit<CreateListStageDto, "listId">
    ): Promise<ListStage> {
        // TODO Handle `order` value (I think we can use extra input field in FE `after/before stage`)
        return this.listStagesService.create({ ...createListDto, listId });
    }

    // TODO Reorder Request
    // @Patch(":id/reorder")

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateListDto: UpdateListStageDto
    ): Promise<ListStage> {
        // TODO Handle Authorization (I think, we can use CASL?) --implement in all Request too--
        return this.listStagesService.update(id, updateListDto);
    }

    @Delete(":id")
    remove(@Param("id") id: number): Promise<void> {
        return this.listStagesService.remove(id);
    }
}
