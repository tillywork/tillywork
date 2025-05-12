import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CardActivity } from "./card.activity.entity";
import { CreateCardActivityDto } from "./dto/create.card.activity.dto";
import { UpdateCardActivityDto } from "./dto/update.card.activity.dto";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ActivityType } from "@tillywork/shared";
import { QueryBuilderHelper } from "../../helpers/query.builder.helper";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TillyLogger } from "../../logger/tilly.logger";

export class FindAllParams {
    @IsOptional()
    workspaceId?: number;

    @IsOptional()
    cardId?: number;

    @IsOptional()
    @IsEnum(ActivityType)
    type?: ActivityType;

    @IsOptional()
    assignee?: number[];

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === true || value === false) return value;
        if (typeof value === "string") {
            const lowercased = value.toLowerCase();
            if (lowercased === "true") return true;
            if (lowercased === "false") return false;
        }
        return undefined;
    })
    isCompleted?: boolean;

    @IsOptional()
    sortBy?: string;

    @IsOptional()
    sortOrder?: "asc" | "desc";

    @IsOptional()
    dueDateStart?: string;

    @IsOptional()
    dueDateEnd?: string;
}

@Injectable()
export class CardActivitiesService {
    private readonly logger = new TillyLogger("CardActivitiesService");

    constructor(
        @InjectRepository(CardActivity)
        private cardActivitiesRepository: Repository<CardActivity>,
        private eventEmitter: EventEmitter2
    ) {}

    async findAll({
        workspaceId,
        cardId,
        type,
        assignee,
        dueDateStart,
        dueDateEnd,
        isCompleted,
        sortBy = "createdAt",
        sortOrder = "asc",
    }: FindAllParams): Promise<CardActivity[]> {
        const queryBuilder = this.cardActivitiesRepository
            .createQueryBuilder("cardActivity")
            .leftJoinAndSelect("cardActivity.card", "card")
            .leftJoinAndSelect("cardActivity.createdBy", "createdBy");

        if (workspaceId) {
            queryBuilder.andWhere("card.workspace.id = :workspaceId", {
                workspaceId,
            });
        }

        if (cardId) {
            queryBuilder.andWhere("card.id = :cardId", { cardId });
        }

        if (type) {
            queryBuilder.andWhere("cardActivity.type = :type", { type });
        }

        if (assignee?.length) {
            queryBuilder.andWhere(
                `EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements("cardActivity".content->'assignee') as elem
                    WHERE (elem)::text::int = ANY(:assignee)
                )`,
                { assignee }
            );
        }

        if (dueDateStart && dueDateEnd) {
            const newStart = QueryBuilderHelper.processValue(dueDateStart);
            const newEnd = QueryBuilderHelper.processValue(dueDateEnd);

            queryBuilder.andWhere(
                `"cardActivity".content->>'dueAt' BETWEEN :dueDateStart AND :dueDateEnd`,
                {
                    dueDateStart: newStart,
                    dueDateEnd: newEnd,
                }
            );
        }

        if (isCompleted != null) {
            queryBuilder.andWhere(
                `("cardActivity".content->'isCompleted')::boolean = :isCompleted`,
                { isCompleted }
            );
        }

        queryBuilder.orderBy(
            `cardActivity.${sortBy}`,
            sortOrder.toUpperCase() as "ASC" | "DESC"
        );

        return queryBuilder.getMany();
    }

    async findOne(id: number): Promise<CardActivity> {
        const cardActivity = await this.cardActivitiesRepository.findOne({
            where: { id },
        });
        if (!cardActivity) {
            throw new NotFoundException(`CardActivity with ID ${id} not found`);
        }
        return cardActivity;
    }

    async create(
        createCardActivityDto: CreateCardActivityDto
    ): Promise<CardActivity> {
        const cardActivity = this.cardActivitiesRepository.create({
            ...createCardActivityDto,
            card: {
                id: createCardActivityDto.card,
            },
        });
        await this.cardActivitiesRepository.save(cardActivity);

        return cardActivity;
    }

    async update(
        updateCardActivityDto: UpdateCardActivityDto
    ): Promise<CardActivity> {
        const cardActivity = await this.findOne(updateCardActivityDto.id);

        this.cardActivitiesRepository.merge(
            cardActivity,
            updateCardActivityDto
        );
        return this.cardActivitiesRepository.save(cardActivity);
    }

    async remove(id: number): Promise<void> {
        const cardActivity = await this.findOne(id);
        await this.cardActivitiesRepository.remove(cardActivity);
    }
}
