import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    Query,
} from "@nestjs/common";
import { CardTypesService, FindAllParams } from "./card.types.service";
import { CardType } from "./card.type.entity";
import { CreateCardTypeDto } from "./dto/create.card.type.dto";
import { UpdateCardTypeDto } from "./dto/update.card.type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current.user.decorator";
import { User } from "../users/user.entity";

@ApiBearerAuth()
@ApiTags("cardTypes")
@UseGuards(JwtAuthGuard)
@Controller({
    path: "card-types",
    version: "1",
})
export class CardTypesController {
    constructor(private readonly cardTypesService: CardTypesService) {}

    @Get()
    findAll(@Query() query: FindAllParams): Promise<CardType[]> {
        return this.cardTypesService.findAll({
            workspaceId: query.workspaceId,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<CardType> {
        return this.cardTypesService.findOne(id);
    }

    @Post()
    create(
        @Body() createCardTypeDto: CreateCardTypeDto,
        @CurrentUser() user: User
    ): Promise<CardType> {
        return this.cardTypesService.create({
            ...createCardTypeDto,
            createdBy: user,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateCardTypeDto: UpdateCardTypeDto
    ): Promise<CardType> {
        return this.cardTypesService.update(id, updateCardTypeDto);
    }

    @Delete(":id")
    remove(
        @Param("id") id: number,
        @Body() replacementCardType: CardType
    ): Promise<void> {
        return this.cardTypesService.remove({
            id,
            replacementCardType,
        });
    }
}
