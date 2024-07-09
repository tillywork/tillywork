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
import {
    CardFindAllResult,
    CardsService,
    FindAllParams,
} from "./cards.service";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CardListsService } from "./card-lists/card.lists.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("cards")
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
}
