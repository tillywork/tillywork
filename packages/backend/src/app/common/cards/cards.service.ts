import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { QueryFilter } from "../filters/types";
import { QueryBuilderHelper } from "../helpers/query.builder.helper";
import { CardListsService } from "./card-lists/card.lists.service";

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
    ignoreCompleted?: boolean;
    filters?: QueryFilter;
    ignoreChildren?: boolean;
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
        sortBy = "cardLists.order",
        sortOrder = "ASC",
        ignoreCompleted,
        filters,
        ignoreChildren,
    }: FindAllParams): Promise<CardFindAllResult> {
        const skip = (page - 1) * limit;
        const take = limit != -1 ? limit : undefined;

        // Start building the query
        const queryBuilder = this.cardsRepository
            .createQueryBuilder("card")
            .leftJoinAndSelect("card.cardLists", "cardLists")
            .leftJoinAndSelect("cardLists.listStage", "listStage")
            .leftJoinAndSelect("card.users", "users")
            .leftJoinAndSelect("card.children", "children")
            .leftJoinAndSelect("children.cardLists", "childrenCardLists")
            .leftJoinAndSelect(
                "childrenCardLists.listStage",
                "childrenListStage"
            )
            .where("cardLists.list.id = :listId", { listId });

        if (ignoreCompleted) {
            queryBuilder.andWhere("listStage.isCompleted = :isCompleted", {
                isCompleted: false,
            });
        }

        if (ignoreChildren) {
            queryBuilder.andWhere("card.parentId IS NULL");
        }

        if (filters && filters.where) {
            QueryBuilderHelper.buildQuery(queryBuilder, filters.where);
        }

        if (sortBy && sortOrder) {
            queryBuilder.addOrderBy(sortBy, sortOrder);
        }

        const [cards, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        return { cards, total };
    }

    async findOne(id: number): Promise<Card> {
        const card = await this.cardsRepository.findOne({
            where: { id },
            relations: [
                "cardLists",
                "cardLists.listStage",
                "users",
                "parent",
                "children",
                "children.users",
                "children.cardLists",
                "children.cardLists.listStage",
            ],
        });
        if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found`);
        }
        return card;
    }

    async create(createCardDto: CreateCardDto): Promise<Card> {
        const card = this.cardsRepository.create({
            ...createCardDto,
            type: {
                id: createCardDto.type,
            },
            createdBy: {
                id: createCardDto.createdBy,
            },
            workspace: {
                id: createCardDto.workspaceId,
            },
        });

        await this.cardsRepository.save(card);

        if (createCardDto.listId) {
            await this.cardListsService.create({
                cardId: card.id,
                listId: createCardDto.listId,
                listStageId: createCardDto.listStageId,
            });
        }

        return card;
    }

    async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
        const card = await this.findOne(id);

        // Update card fields except for 'users'
        const { users, ...updateFields } = updateCardDto;
        this.cardsRepository.merge(card, updateFields);

        // If 'users' are provided in the update DTO, update the relation
        if (users) {
            // Replace the current card.users with the new list from updateCardDto
            card.users = users;
        }

        return this.cardsRepository.save(card);
    }

    async batchUpdate(
        where: FindOptionsWhere<Card>,
        updateCardDto: UpdateCardDto
    ): Promise<UpdateResult> {
        return this.cardsRepository.update(where, updateCardDto);
    }

    async remove(id: number): Promise<void> {
        const card = await this.findOne(id);
        await this.cardsRepository.softRemove(card);
    }
}
