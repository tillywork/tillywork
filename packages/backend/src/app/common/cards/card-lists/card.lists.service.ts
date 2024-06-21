import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
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

        if (createCardListDto.order) {
            cardList.order = createCardListDto.order;
        } else {
            cardList.order = await this.getNewCardOrder(
                createCardListDto.listStageId
            );
        }

        await this.cardListsRepository.save(cardList);

        return cardList;
    }

    async update(
        id: number,
        updateCardListDto: UpdateCardListDto
    ): Promise<CardList> {
        const cardList = await this.findOne(id);
        this.cardListsRepository.merge(cardList, updateCardListDto);

        // If stage was changed, and order was not updated, move card to bottom of list
        if (updateCardListDto.listStageId && !updateCardListDto.order) {
            cardList.order = await this.getNewCardOrder(
                updateCardListDto.listStageId
            );
        }

        return this.cardListsRepository.save(cardList);
    }

    async batchUpdate(
        where: FindOptionsWhere<CardList>,
        updateCardListDto: UpdateCardListDto
    ): Promise<UpdateResult> {
        return this.cardListsRepository.update(where, updateCardListDto);
    }

    async remove(id: number): Promise<void> {
        const cardList = await this.findOne(id);
        await this.cardListsRepository.remove(cardList);
    }

    /**
     * Get the max order for a list stage + 100
     * @param listStageId
     * @returns The order for the card being inserted to the list
     */
    async getNewCardOrder(listStageId: number): Promise<number> {
        const result = await this.cardListsRepository
            .createQueryBuilder("cardList")
            .select("MAX(cardList.order)", "maxOrder")
            .innerJoin("cardList.card", "card", "card.id = cardList.cardId")
            .where("cardList.listStageId = :listStageId", { listStageId })
            .andWhere("card.deletedAt is null")
            .getRawOne();

        return result.maxOrder ? Number(result.maxOrder) + 100 : 100; // Assume  100 if no cards are present
    }
}
