import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { Card } from "./card.entity";
import { CreateCardDto } from "./dto/create.card.dto";
import { UpdateCardDto } from "./dto/update.card.dto";
import { FilterGroup, QueryFilter } from "../filters/types";
import { QueryBuilderHelper } from "../helpers/query.builder.helper";
import { CardListsService } from "./card-lists/card.lists.service";
import { IsNotEmpty, IsNumber } from "class-validator";
import { RelationIdLoader } from "typeorm/query-builder/relation-id/RelationIdLoader";
import { RelationCountLoader } from "typeorm/query-builder/relation-count/RelationCountLoader";
import { RawSqlResultsToEntityTransformer } from "typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer";
import { RelationCountMetadataToAttributeTransformer } from "typeorm/query-builder/relation-count/RelationCountMetadataToAttributeTransformer";
import { RelationIdMetadataToAttributeTransformer } from "typeorm/query-builder/relation-id/RelationIdMetadataToAttributeTransformer";
import { ClsService } from "nestjs-cls";
import { PermissionLevel, TriggerType } from "@tillywork/shared";
import { AccessControlService } from "../auth/services/access.control.service";
import { Field } from "../fields/field.entity";
import { AclContext } from "../auth/context/acl.context";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TriggerEvent } from "../automations/events/trigger.event";

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
    hideCompleted?: boolean;
    filters?: QueryFilter;
    hideChildren?: boolean;
}

@Injectable()
export class CardsService {
    private readonly logger = new Logger("CardsService");
    constructor(
        @InjectRepository(Card)
        private cardsRepository: Repository<Card>,
        private cardListsService: CardListsService,
        @Inject(forwardRef(() => AccessControlService))
        private accessControlService: AccessControlService,
        private clsService: ClsService,
        private readonly aclContext: AclContext,
        private eventEmitter: EventEmitter2
    ) {}

    async findAll({
        listId,
        page = 1,
        limit = 10,
        sortBy = "cardLists.order",
        sortOrder = "ASC",
        hideCompleted,
        filters,
        hideChildren,
    }: FindAllParams): Promise<CardFindAllResult> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "list",
            listId,
            PermissionLevel.VIEWER
        );

        const skip = (page - 1) * limit;
        const take = limit != -1 ? limit : undefined;

        // Start building the query
        const queryBuilder = this.cardsRepository
            .createQueryBuilder("card")
            .leftJoinAndSelect("card.cardLists", "cardLists")
            .leftJoinAndSelect("cardLists.listStage", "listStage")
            .leftJoinAndSelect("card.children", "children")
            .leftJoinAndSelect("children.cardLists", "childrenCardLists")
            .leftJoinAndSelect(
                "childrenCardLists.listStage",
                "childrenListStage"
            )
            .innerJoinAndSelect("card.type", "type")
            .where("cardLists.list.id = :listId", { listId });

        if (hideCompleted) {
            queryBuilder.andWhere("listStage.isCompleted IS NOT TRUE");
        }

        if (hideChildren) {
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
        const user = this.clsService.get("user");

        const card = await this.cardsRepository.findOne({
            where: { id },
            relations: [
                "cardLists",
                "cardLists.listStage",
                "cardLists.list.space",
                "parent",
                "children",
                "children.cardLists",
                "children.cardLists.listStage",
                "workspace",
            ],
        });

        if (!card) {
            throw new NotFoundException(`Card with ID ${id} not found`);
        }

        if (!this.aclContext.shouldSkipAcl()) {
            await this.accessControlService.authorize(
                user,
                "list",
                card.cardLists.map((cardList) => cardList.listId),
                PermissionLevel.VIEWER
            );
        }

        return card;
    }

    async searchCards({
        keyword,
        workspaceId,
        cardTypeId,
    }: {
        keyword: string;
        cardTypeId: number;
        workspaceId: number;
    }): Promise<Card[]> {
        const titleField = await this.cardsRepository.manager
            .getRepository(Field)
            .findOne({
                where: {
                    cardType: {
                        id: cardTypeId,
                    },
                    isTitle: true,
                },
            });

        const queryBuilder = this.cardsRepository
            .createQueryBuilder("card")
            .where(
                new Brackets((qb) => {
                    qb.where(
                        `card.data ->> '${titleField.slug}' ILIKE :keyword`,
                        { keyword: `%${keyword}%` }
                    );
                })
            )
            .andWhere("card.workspaceId = :workspaceId", { workspaceId })
            .andWhere(`card.typeId = :cardTypeId`, { cardTypeId })
            .orderBy("card.createdAt", "DESC")
            .limit(15);

        const cards = await queryBuilder.getMany();
        return cards;
    }

    async create(createCardDto: CreateCardDto): Promise<Card> {
        const card = this.cardsRepository.create({
            parent: {
                id: createCardDto.parentId,
            },
            ...createCardDto,
            type: {
                id: createCardDto.type,
            },
            createdBy: createCardDto.createdBy
                ? {
                      id: createCardDto.createdBy,
                  }
                : undefined,
            workspace: {
                id: createCardDto.workspaceId,
            },
        });

        await this.cardsRepository.save(card);

        if (createCardDto.listId) {
            const cardList = await this.cardListsService.create({
                cardId: card.id,
                listId: createCardDto.listId,
                listStageId:
                    createCardDto.listStageId ?? createCardDto.listStage?.id,
            });
            card.cardLists = [cardList];
        }

        if (createCardDto.createdByType !== "automation") {
            this.eventEmitter.emit(
                "automation.trigger",
                new TriggerEvent(TriggerType.CARD_CREATED, card.id, card)
            );
        }

        return card;
    }

    async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
        const user = this.clsService.get("user");
        const card = await this.findOne(id);

        if (!this.aclContext.shouldSkipAcl()) {
            await this.accessControlService.authorize(
                user,
                "list",
                card.cardLists.map((cardList) => cardList.listId),
                PermissionLevel.EDITOR
            );
        }

        this.cardsRepository.merge(card, updateCardDto);

        return this.cardsRepository.save(card);
    }

    async batchUpdate(
        where: FindOptionsWhere<Card>,
        updateCardDto: UpdateCardDto
    ): Promise<UpdateResult> {
        return this.cardsRepository.update(where, updateCardDto);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");
        const card = await this.findOne(id);

        if (!this.aclContext.shouldSkipAcl()) {
            await this.accessControlService.authorize(
                user,
                "workspace",
                card.workspace.id,
                PermissionLevel.EDITOR
            );
        }

        await this.cardsRepository.softRemove(card);
    }

    async getCardTitle(card: Card): Promise<string> {
        const titleField = await this.cardsRepository.manager
            .getRepository(Field)
            .findOne({
                where: {
                    cardType: { id: card.type.id },
                    isTitle: true,
                },
            });

        if (!titleField) return "No title field";

        return card.data?.[titleField.slug] ?? "Untitled";
    }
}
