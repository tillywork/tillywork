import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './interaction.entity';
import { CreateInteractionDto } from './dto/create.interaction.dto';
import { UpdateInteractionDto } from './dto/update.interaction.dto';
// Add imports for DTOs

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>
  ) {}

  async findAll(): Promise<Interaction[]> {
    return await this.interactionsRepository.find({ relations: ['contact'] });
  }

  async findOne(id: string): Promise<Interaction> {
    const interaction = await this.interactionsRepository.findOne({
      where: { id },
      relations: ['contact'],
    });
    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }
    return interaction;
  }

  async create(
    createInteractionDto: CreateInteractionDto
  ): Promise<Interaction> {
    const interaction =
      this.interactionsRepository.create(createInteractionDto);
    return this.interactionsRepository.save(interaction);
  }

  async update(
    id: string,
    updateInteractionDto: UpdateInteractionDto
  ): Promise<Interaction> {
    const interaction = await this.findOne(id);
    this.interactionsRepository.merge(interaction, updateInteractionDto);
    return this.interactionsRepository.save(interaction);
  }

  async remove(id: string): Promise<void> {
    const interaction = await this.findOne(id);
    await this.interactionsRepository.remove(interaction);
  }
}
