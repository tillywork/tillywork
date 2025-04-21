import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Logger,
    Query,
    BadRequestException,
} from "@nestjs/common";
import {
    CardFindAllResult,
    CardsService,
    FindAllParams,
} from "./cards.service";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";

@ApiBearerAuth()
@ApiTags("cards")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "cards",
    version: "1",
})
export class CardsController {
    private readonly logger = new Logger("CardsController");
    constructor(private readonly cardsService: CardsService) {}

    @Get()
    search(
        @Query("q") q: string,
        @Query("workspaceId") workspaceId: number,
        @Query("cardTypeId") cardTypeId: number
    ): Promise<Card[]> {
        if (!q || !workspaceId) {
            throw new BadRequestException(
                "The following query params are required: q, workspaceId"
            );
        }

        return this.cardsService.searchCards({
            keyword: q,
            workspaceId,
            cardTypeId,
        });
    }

    @Post("search")
    findAll(
        @Body()
        body: FindAllParams
    ): Promise<CardFindAllResult> {
        return this.cardsService.findAll(body);
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Card> {
        return this.cardsService.findOne(+id);
    }

    @Post()
    create(
        @Body() createCardDto: CreateCardDto,
        @CurrentUser() user: User
    ): Promise<Card> {
        createCardDto.createdBy = user.id;
        createCardDto.createdByType = "user";

        return this.cardsService.create(createCardDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateCardDto: UpdateCardDto
    ): Promise<Card> {
        return this.cardsService.update(+id, updateCardDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.cardsService.remove(+id);
    }
}
