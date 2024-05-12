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
    Request,
} from "@nestjs/common";
import { CardFindAllResult, CardsService } from "./cards.service";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { UpdateCardListDto } from "./dto/update.card.list.dto";
import { CardListsService } from "./card.lists.service";
import { QueryFilter } from "../filters/types";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "cards",
    version: "1",
})
export class CardsController {
    private readonly logger = new Logger("CardsController");
    constructor(
        private readonly cardsService: CardsService,
        private readonly cardListsService: CardListsService
    ) {}

    @Post("search")
    findAll(
        @Body()
        body: {
            listId: number;
            page?: number;
            limit?: number;
            sortBy?: string;
            sortOrder?: "ASC" | "DESC";
            filters?: QueryFilter;
        }
    ): Promise<CardFindAllResult> {
        const { listId, page, limit, sortBy, sortOrder, filters } = body;

        return this.cardsService.findAll({
            listId,
            page,
            limit,
            sortBy,
            sortOrder,
            filters,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Card> {
        return this.cardsService.findOne(+id);
    }

    @Post()
    create(
        @Body() createCardDto: CreateCardDto,
        @Request() req
    ): Promise<Card> {
        const { user } = req;
        createCardDto.createdBy = user.id;
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

    @Put("/lists/:cardListId")
    updateCardList(
        @Param("cardListId") cardListId: number,
        @Body() updateCardListDto: UpdateCardListDto
    ) {
        return this.cardListsService.update(cardListId, updateCardListDto);
    }
}
