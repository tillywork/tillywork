import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { CardType } from "./card.type.entity";
import { CreateCardTypeDto } from "./dto/create.card.type.dto";
import { UpdateCardTypeDto } from "./dto/update.card.type.dto";

@Injectable()
export class CardTypesService {
    constructor(
        @InjectRepository(CardType)
        private cardTypesRepository: Repository<CardType>
    ) {}

    async findAll(options?: FindManyOptions<CardType>): Promise<CardType[]> {
        return this.cardTypesRepository.find(options);
    }

    async findOne(id: number): Promise<CardType> {
        const cardType = await this.cardTypesRepository.findOne({
            where: { id },
        });
        if (!cardType) {
            throw new NotFoundException(`CardType with ID ${id} not found`);
        }
        return cardType;
    }

    async findOneBy({
        where,
    }: {
        where: FindOptionsWhere<CardType>;
    }): Promise<CardType> {
        return this.cardTypesRepository.findOne({ where });
    }

    async create(createCardTypeDto: CreateCardTypeDto): Promise<CardType> {
        const cardType = this.cardTypesRepository.create(createCardTypeDto);
        return this.cardTypesRepository.save(cardType);
    }

    async update(
        id: number,
        updateCardTypeDto: UpdateCardTypeDto
    ): Promise<CardType> {
        const cardType = await this.findOne(id);
        this.cardTypesRepository.merge(cardType, updateCardTypeDto);
        return this.cardTypesRepository.save(cardType);
    }

    async remove(id: number): Promise<void> {
        const cardType = await this.findOne(id);
        await this.cardTypesRepository.remove(cardType);
    }
}
