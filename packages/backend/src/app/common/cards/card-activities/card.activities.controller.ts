import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    CardActivitiesService,
    FindAllParams,
} from "./card.activities.service";
import { CreateCardActivityDto } from "./dto/create.card.activity.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current.user.decorator";
import { User } from "../../users/user.entity";
import { UpdateCardActivityDto } from "./dto/update.card.activity.dto";

@ApiBearerAuth()
@ApiTags("cards")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "/cards/activities",
    version: "1",
})
export class CardActivitiesController {
    private readonly logger = new Logger("CardActivitiesController");

    constructor(
        private readonly cardActivitiesService: CardActivitiesService
    ) {}

    @Get()
    find(@Query() query: FindAllParams) {
        const {
            cardId,
            workspaceId,
            type,
            sortBy,
            sortOrder,
            assignee,
            dueDateStart,
            dueDateEnd,
        } = query;

        return this.cardActivitiesService.findAll({
            cardId,
            workspaceId,
            type,
            assignee,
            dueDateStart,
            dueDateEnd,
            sortBy,
            sortOrder,
        });
    }

    @Post()
    create(
        @Body() createActivityDto: CreateCardActivityDto,
        @CurrentUser() user: User
    ) {
        createActivityDto.createdBy = user;
        return this.cardActivitiesService.create(createActivityDto);
    }

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateCardActivityDto: UpdateCardActivityDto
    ) {
        updateCardActivityDto.id = id;
        return this.cardActivitiesService.update(updateCardActivityDto);
    }

    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.cardActivitiesService.remove(id);
    }
}
