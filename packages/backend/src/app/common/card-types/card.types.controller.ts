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
import { CardTypesService } from "./card.types.service";
import { CardType } from "./card.type.entity";
import { CreateCardTypeDto } from "./dto/create.card.type.dto";
import { UpdateCardTypeDto } from "./dto/update.card.type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

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
    findAll(@Query("workspaceId") workspaceId: number): Promise<CardType[]> {
        return this.cardTypesService.findAll({
            where: {
                workspace: {
                    id: workspaceId,
                },
            },
        });
    }

    @Get(":id")
    findOne(@Param("id") id: string): Promise<CardType> {
        return this.cardTypesService.findOne(+id);
    }

    @Post()
    create(@Body() createCardTypeDto: CreateCardTypeDto): Promise<CardType> {
        return this.cardTypesService.create({
            ...createCardTypeDto,
        });
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() updateUserDto: UpdateCardTypeDto
    ): Promise<CardType> {
        return this.cardTypesService.update(+id, updateUserDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.cardTypesService.remove(+id);
    }
}
