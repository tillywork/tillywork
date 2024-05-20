import {
    Controller,
    Body,
    Param,
    Put,
    UseGuards,
    Logger,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.auth.guard";
import { CardListsService } from "./card.lists.service";
import { UpdateCardListDto } from "./dto/update.card.list.dto";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "cards/:cardId/lists",
    version: "1",
})
export class CardListssController {
    private readonly logger = new Logger("CardListssController");
    constructor(private readonly cardListsService: CardListsService) {}

    @Put("/:cardListId")
    updateCardList(
        @Param("cardListId") cardListId: number,
        @Body() updateCardListDto: UpdateCardListDto
    ) {
        return this.cardListsService.update(cardListId, updateCardListDto);
    }
}
