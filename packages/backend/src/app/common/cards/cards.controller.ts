import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards
} from "@nestjs/common";
import { CardFindAllResult, CardsService } from "./cards.service";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "cards",
    version: "1",
})
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

    @Get()
    findAll(): Promise<CardFindAllResult> {
        return this.cardsService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<Card> {
        return this.cardsService.findOne(+id);
    }

    @Post()
    create(
        @Body() createCardDto: CreateCardDto
    ): Promise<Card> {
        return this.cardsService.create(createCardDto);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateCardDto
    ): Promise<Card> {
        return this.cardsService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.cardsService.remove(+id);
    }
}
