import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { ObjectHelper } from "../helpers/object.helper";
import { QueryFilter } from "../filters/types";
import { QueryBuilderHelper } from "../helpers/query.builder.helper";
import { CardListsService } from "./card.lists.service";

export type CardFindAllResult = {
    total: number;
    cards: Card[];
};

export interface FindAllParams {
    listId: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    filters?: QueryFilter;
}

@Injectable()
export class CardsService {
    private readonly logger = new Logger("CardsService");
    constructor(
        @InjectRepository(Card)
        private cardsRepository: Repository<Card>,
        private cardListsService: CardListsService
    ) {}

    async findAll({
        listId,
        page = 1,
        limit = 10,
        sortBy,
        sortOrder,
        filters,
    }: FindAllParams): Promise<CardFindAllResult> {
        const skip = (page - 1) * limit;
        const take = limit != -1 ? limit : undefined;
        const order = {};

        if (sortBy && sortOrder) {
            order[sortBy] = sortOrder;
        }

        const listFilter: QueryFilter = {
            where: {
                and: [
                    {
                        field: "cardLists.list.id",
                        operator: "eq",
                        value: listId,
                    },
                ],
            },
        };

        let where: FindOptionsWhere<Card>;
        if (filters) {
            const combinedFilters: QueryFilter = ObjectHelper.deepMergeObjects(
                listFilter,
                filters
            );
            where = QueryBuilderHelper.buildQuery(combinedFilters.where);
        } else {
            where = QueryBuilderHelper.buildQuery(listFilter.where);
        }

        const [cards, total] = await this.cardsRepository.findAndCount({
            where,
            relations: ["cardLists", "cardLists.listStage", "users"],
            take: take,
            skip: skip,
            order: order,
        });

        return { cards, total };
    }

    async findOne(id: number): Promise<Card> {
        const card = await this.cardsRepository.findOne({
            where: { id },
            relations: ["cardLists", "cardLists.listStage"],
        });
        if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found`);
        }
        return card;
    }

    async create(createCardDto: CreateCardDto): Promise<Card> {
        const card = this.cardsRepository.create(createCardDto);
        await this.cardsRepository.save(card);

        const cardList = await this.cardListsService.create({
            cardId: card.id,
            listId: createCardDto.listId,
            listStageId: createCardDto.listStageId,
        });
        return { ...card, cardLists: [cardList] };
    }

    async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
        const card = await this.findOne(id);
        this.cardsRepository.merge(card, updateCardDto);
        return this.cardsRepository.save(card);
    }

    async remove(id: number): Promise<void> {
        const card = await this.findOne(id);
        await this.cardsRepository.remove(card);
    }
}
