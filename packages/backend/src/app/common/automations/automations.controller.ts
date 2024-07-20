import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from "@nestjs/common";
import { AutomationsService } from "./services/automations.service";
import { CreateAutomationDto } from "./dto/create.automation.dto";
import { UpdateAutomationDto } from "./dto/update.automation.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@ApiBearerAuth()
@ApiTags("automations")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "automations",
    version: "1",
})
export class AutomationsController {
    constructor(private automationsService: AutomationsService) {}

    @Get()
    findAll(@Query("workspaceId") workspaceId: number) {
        return this.automationsService.findAll({
            workspaceId,
        });
    }

    @Post()
    create(
        @Body() createAutomationDto: CreateAutomationDto,
        @Request() request
    ) {
        const { user } = request;
        return this.automationsService.create({
            ...createAutomationDto,
            createdBy: user,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateAutomationDto: UpdateAutomationDto
    ) {
        return this.automationsService.update(id, updateAutomationDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.automationsService.delete(id);
    }
}
