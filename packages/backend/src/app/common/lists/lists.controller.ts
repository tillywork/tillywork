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
import { ListFindAllResult, ListsService } from "./lists.service";
import { List } from "./list.entity";
import { CreateListDto } from "./dto/create.list.dto";
import { UpdateListDto } from "./dto/update.list.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ListStage } from "./list.stage.entity";
import { ListStagesService } from "./list.stages.service";
import { ListGroupOptions } from "./types";
import { ListGroupsService } from "./list.groups.service";
import { UpdateListGroupDto } from "./dto/update.list.group.dto";
import { ViewSortOption } from "../views/types";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "lists",
    version: "1",
})
export class ListsController {
    constructor(
        private readonly listsService: ListsService,
        private readonly listStagesService: ListStagesService,
        private readonly listGroupsService: ListGroupsService
    ) {}

    @Get()
    findAll(): Promise<ListFindAllResult> {
        return this.listsService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<List> {
        return this.listsService.findOne(+id);
    }

    @Post()
    create(@Body() createListDto: CreateListDto): Promise<List> {
        return this.listsService.create(createListDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateListDto
    ): Promise<List> {
        return this.listsService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.listsService.remove(+id);
    }

    @Get(":listId/stages")
    findStages(@Param("listId") listId: number): Promise<ListStage[]> {
        return this.listStagesService.findAll({
            listId,
        });
    }

    @Post(":listId/groups")
    generateGroups(
        @Param("listId") listId: number,
        @Body()
        {
            groupBy,
            sortCardsBy,
        }: { groupBy: ListGroupOptions; sortCardsBy: ViewSortOption[] }
    ) {
        return this.listGroupsService.generateGroups({
            listId,
            groupBy: groupBy ?? ListGroupOptions.ALL,
            sortCardsBy,
        });
    }

    @Put(":listId/groups/:listGroupId")
    updateGroup(
        @Param("listId") listId: number,
        @Param("listGroupId") listGroupId: number,
        @Body() updateListGroupDto: UpdateListGroupDto
    ) {
        return this.listGroupsService.update(listGroupId, updateListGroupDto);
    }
}
