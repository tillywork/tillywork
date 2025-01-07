import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CardActivity } from "./card.activity.entity";
import { CreateCardActivityDto } from "./dto/create.card.activity.dto";
import { UpdateCardActivityDto } from "./dto/update.card.activity.dto";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { ActivityType } from "@tillywork/shared";
import { QueryBuilderHelper } from "../../helpers/query.builder.helper";

export class FindAllParams {
    @IsOptional()
    workspaceId?: number;

    @IsOptional()
    cardId?: number;

    @IsOptional()
    @IsEnum(ActivityType)
    type?: ActivityType;

    @IsOptional()
    @IsNumber()
    assignee?: number;

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
    constructor(
        @InjectRepository(CardActivity)
        private cardActivitiesRepository: Repository<CardActivity>
    ) {}

    async findAll({
        workspaceId,
        cardId,
        type,
        assignee,
        dueDateStart,
        dueDateEnd,
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

        if (assignee) {
            queryBuilder.andWhere(
                `"cardActivity".content->'assignee' @> :assignee`,
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
        const cardActivity = await this.cardActivitiesRepository.insert({
            ...createCardActivityDto,
            card: {
                id: createCardActivityDto.card,
            },
        });

        return cardActivity.raw[0];
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
