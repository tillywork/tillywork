import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CardList } from "./card.list.entity";
import { CreateCardListDto } from "./dto/create.card.list.dto";
import { UpdateCardListDto } from "./dto/update.card.list.dto";

export interface FindAllParams {
    listId: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export type UpdateCardListStageParams = {
    cardId: number;
    cardListId: number;
    listStageId: number;
};

@Injectable()
export class CardListsService {
    constructor(
        @InjectRepository(CardList)
        private cardListsRepository: Repository<CardList>
    ) {}

    async findAll({ sortBy, sortOrder }: FindAllParams): Promise<CardList[]> {
        const order = {};

        if (sortBy && sortOrder) {
            order[sortBy] = sortOrder;
        }

        const cardLists = await this.cardListsRepository.find({
            where: {},
            order: order,
        });

        return cardLists;
    }

    async findOne(id: number): Promise<CardList> {
        const cardList = await this.cardListsRepository.findOne({
            where: { id },
        });
        if (!cardList) {
            throw new NotFoundException(`CardList with ID ${id} not found`);
        }
        return cardList;
    }

    async create(createCardListDto: CreateCardListDto): Promise<CardList> {
        const cardList = this.cardListsRepository.create({
            card: {
                id: createCardListDto.cardId,
            },
            list: {
                id: createCardListDto.listId,
            },
            listStage: {
                id: createCardListDto.listStageId,
            },
        });
        await this.cardListsRepository.save(cardList);

        return cardList;
    }

    async update(
        id: number,
        updateCardListDto: UpdateCardListDto
    ): Promise<CardList> {
        const cardList = await this.findOne(id);
        this.cardListsRepository.merge(cardList, updateCardListDto);
        return this.cardListsRepository.save(cardList);
    }

    async remove(id: number): Promise<void> {
        const cardList = await this.findOne(id);
        await this.cardListsRepository.remove(cardList);
    }
}
