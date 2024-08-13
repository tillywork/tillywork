import { Controller, Post, Body, Param, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { UpdateListGroupDto } from "./dto/update.list.group.dto";
import { GenerateGroupsParams, ListGroupsService } from "./list.groups.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("lists")
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
            hideCompleted,
            groupBy,
            fieldId,
        }: Omit<GenerateGroupsParams, "listId">
    ) {
        return this.listGroupsService.generateGroups({
            listId,
            hideCompleted,
            groupBy,
            fieldId,
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
