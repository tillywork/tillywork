import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CardActivity } from "./card.activity.entity";
import { CreateCardActivityDto } from "./dto/create.card.activity.dto";

export interface FindAllParams {
    cardId: number;
}

@Injectable()
export class CardActivitiesService {
    constructor(
        @InjectRepository(CardActivity)
        private cardActivitiesRepository: Repository<CardActivity>
    ) {}

    async findAll({ cardId }: FindAllParams): Promise<CardActivity[]> {
        const cardActivities = await this.cardActivitiesRepository.find({
            where: {
                card: {
                    id: cardId,
                },
            },
            order: {
                createdAt: "ASC",
            },
            relations: ["createdBy"],
        });

        return cardActivities;
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

    async remove(id: number): Promise<void> {
        const cardActivity = await this.findOne(id);
        await this.cardActivitiesRepository.remove(cardActivity);
    }
}
