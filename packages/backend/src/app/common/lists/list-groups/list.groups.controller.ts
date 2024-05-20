import { Controller, Post, Body, Param, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { ViewSortOption } from "../../views/types";
import { UpdateListGroupDto } from "../dto/update.list.group.dto";
import { ListGroupOptions } from "../types";
import { ListGroupsService } from "./list.groups.service";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "lists/:listId/groups",
    version: "1",
})
export class ListGroupsController {
    constructor(private readonly listGroupsService: ListGroupsService) {}

    @Post()
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

    @Put(":listGroupId")
    updateGroup(
        @Param("listId") listId: number,
        @Param("listGroupId") listGroupId: number,
        @Body() updateListGroupDto: UpdateListGroupDto
    ) {
        return this.listGroupsService.update(listGroupId, updateListGroupDto);
    }
}
