import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { CardList } from "./card.list.entity";
import {
    QueryBuilderHelper,
    QueryFilter,
} from "../helpers/query.builder.helper";
import { ObjectHelper } from "../helpers/object.helper";

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
        @InjectRepository(CardList)
        private cardListsRepository: Repository<CardList>
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

        let where: any = { cardLists: { list: { id: listId } } };
        if (filters) {
            const builtFilters = QueryBuilderHelper.buildQuery(filters.where);
            this.logger.debug({ builtFilters });
            where = ObjectHelper.deepMergeObjects(where, builtFilters);
        }
        this.logger.debug({ filters, where });

        const [cards, total] = await this.cardsRepository.findAndCount({
            where,
            relations: ["cardLists", "cardLists.listStage"],
            take: take,
            skip: skip,
            order: order,
        });

        return { cards, total };
    }

    async findOne(id: number): Promise<Card> {
        const card = await this.cardsRepository.findOne({ where: { id } });
        if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found`);
        }
        return card;
    }

    async create(createCardDto: CreateCardDto): Promise<Card> {
        const card = this.cardsRepository.create({
            title: createCardDto.title,
        });
        await this.cardsRepository.save(card);

        const cardList = this.cardListsRepository.create({
            card,
            list: {
                id: createCardDto.listId,
            },
            listStageId: createCardDto.listStageId,
        });
        await this.cardListsRepository.save(cardList);

        return card;
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
