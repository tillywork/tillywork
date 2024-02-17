import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { InteractionsService } from './interaction.service';
import { Interaction } from './interaction.entity';
import { CreateInteractionDto } from './dto/create.interaction.dto';
import { UpdateInteractionDto } from './dto/update.interaction.dto';
// Import DTO classes

@Controller({
  path: 'interactions',
  version: '1',
})
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get()
  findAll(): Promise<Interaction[]> {
    return this.interactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Interaction> {
    return this.interactionsService.findOne(id);
  }

  @Post()
  create(
    @Body() createInteractionDto: CreateInteractionDto
  ): Promise<Interaction> {
    return this.interactionsService.create(createInteractionDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateInteractionDto: UpdateInteractionDto
  ): Promise<Interaction> {
    return this.interactionsService.update(id, updateInteractionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.interactionsService.remove(id);
  }
}
