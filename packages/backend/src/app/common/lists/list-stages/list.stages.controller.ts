import { Controller, Param, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { ListStage } from "./list.stage.entity";
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
}
