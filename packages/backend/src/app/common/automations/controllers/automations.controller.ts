import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import {
    AutomationsService,
    FindAllParams,
} from "../services/automations.service";
import { CreateAutomationDto } from "../dto/create.automation.dto";
import { UpdateAutomationDto } from "../dto/update.automation.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { CurrentUser } from "../../auth/decorators/current.user.decorator";
import { User } from "../../users/user.entity";

@ApiBearerAuth()
@ApiTags("automations")
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
    path: "automations",
    version: "1",
})
export class AutomationsController {
    constructor(private automationsService: AutomationsService) {}

    @Get()
    findAll(@Query() query: FindAllParams) {
        const { workspaceId, spaceId, listId } = query;
        return this.automationsService.findAll({
            workspaceId,
            spaceId,
            listId,
        });
    }

    @Get(":id")
    find(@Param("id") id: string) {
        return this.automationsService.findOne(id);
    }

    @Post()
    create(
        @Body() createAutomationDto: CreateAutomationDto,
        @CurrentUser() user: User
    ) {
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

    @Post(":id/duplicate")
    duplicate(@Param("id") id: string) {
        return this.automationsService.duplicate(id);
    }
}
