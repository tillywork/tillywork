import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CreateCardDto } from './dto/create.card.dto';
import { UpdateCardDto } from './dto/update.card.dto';

export type CardFindAllResult = {
  total: number;
  cards: Card[];
};

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>
  ) {}

  async findAll(): Promise<CardFindAllResult> {
    const result = await this.cardsRepository.findAndCount();
    return { cards: result[0], total: result[1] };
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
        attributes: createCardDto
    });
    return this.cardsRepository.save(card);
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
