import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { FilterGroup, QueryFilter } from "../filters/types";
import { QueryBuilderHelper } from "../helpers/query.builder.helper";
import { CardListsService } from "./card-lists/card.lists.service";
import { IsNotEmpty, IsNumber } from "class-validator";
import { CardList } from "./card-lists/card.list.entity";
import { User } from "../users/user.entity";
import { RelationIdLoader } from "typeorm/query-builder/relation-id/RelationIdLoader";
import { RelationCountLoader } from "typeorm/query-builder/relation-count/RelationCountLoader";
import { RawSqlResultsToEntityTransformer } from "typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer";
import { RelationCountMetadataToAttributeTransformer } from "typeorm/query-builder/relation-count/RelationCountMetadataToAttributeTransformer";
import { RelationIdMetadataToAttributeTransformer } from "typeorm/query-builder/relation-id/RelationIdMetadataToAttributeTransformer";

export type CardFindAllResult = {
    total: number;
    cards: Card[];
};

export class FindAllParams {
    @IsNotEmpty()
    @IsNumber()
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
        @InjectRepository(CardList)
        private cardListsRepository: Repository<CardList>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
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
            QueryBuilderHelper.buildQuery(
                queryBuilder,
                filters.where as FilterGroup
            );
        }

        if (sortBy && sortOrder) {
            queryBuilder.addOrderBy(sortBy, sortOrder, "NULLS LAST");
        }

        /**
         * TypeORM doesn't support querying while ordering
         * on a JSONB column using getMany or getManyAndCount,
         * so we have to extract the SQL and run it manually.
         */
        const [sql, params] = queryBuilder.getQueryAndParameters();

        const connection = this.cardsRepository.manager.connection;
        const queryRunner = connection.createQueryRunner(
            connection.defaultReplicationModeForReads()
        );

        try {
            // Taken from https://github.com/typeorm/typeorm/blob/master/src/query-builder/SelectQueryBuilder.ts#L3373
            const relationIdLoader = new RelationIdLoader(
                connection,
                queryRunner,
                queryBuilder.expressionMap.relationIdAttributes
            );
            const relationCountLoader = new RelationCountLoader(
                connection,
                queryRunner,
                queryBuilder.expressionMap.relationCountAttributes
            );

            const relationIdMetadataTransformer =
                new RelationIdMetadataToAttributeTransformer(
                    queryBuilder.expressionMap
                );
            relationIdMetadataTransformer.transform();
            const relationCountMetadataTransformer =
                new RelationCountMetadataToAttributeTransformer(
                    queryBuilder.expressionMap
                );
            relationCountMetadataTransformer.transform();

            const rawResults = await queryRunner.query(
                sql + ` OFFSET ${skip} LIMIT ${take}`,
                params,
                true
            );

            const rawRelationIdResults = await relationIdLoader.load(
                rawResults.records
            );
            const rawRelationCountResults = await relationCountLoader.load(
                rawResults.records
            );
            const transformer = new RawSqlResultsToEntityTransformer(
                queryBuilder.expressionMap,
                connection.driver,
                rawRelationIdResults,
                rawRelationCountResults,
                queryRunner
            );

            const totalCountQuery = queryBuilder.clone().orderBy();
            const totalResult = await totalCountQuery.getCount();
            const total = totalResult ?? 0;

            const cards = transformer.transform(
                rawResults.records,
                queryBuilder.expressionMap.mainAlias
            );

            return { cards, total };
        } finally {
            await queryRunner.release();
        }
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

    async searchCards({
        keyword,
        workspaceId,
        cardTypeId,
    }: {
        keyword: string;
        cardTypeId?: number;
        workspaceId: number;
    }): Promise<Card[]> {
        const queryBuilder = this.cardsRepository
            .createQueryBuilder("card")
            .leftJoinAndSelect("card.users", "user")
            .where(
                new Brackets((qb) => {
                    qb.where("card.data ->> 'title' ILIKE :keyword", {
                        keyword: `%${keyword}%`,
                    }).orWhere(
                        "user.firstName || ' ' || user.lastName ILIKE :keyword",
                        { keyword: `%${keyword}%` }
                    );
                })
            )
            .andWhere("card.workspaceId = :workspaceId", { workspaceId })
            .orderBy("card.createdAt", "DESC")
            .limit(15);

        if (cardTypeId) {
            queryBuilder.andWhere(`card.typeId = :cardTypeId`, { cardTypeId });
        }

        const cards = await queryBuilder.getMany();
        return cards;
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
