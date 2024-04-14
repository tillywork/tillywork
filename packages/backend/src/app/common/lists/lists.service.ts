import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { CreateListDto } from './dto/create.list.dto';
import { UpdateListDto } from './dto/update.list.dto';

export type ListFindAllResult = {
  total: number;
  lists: List[];
};

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private listsRepository: Repository<List>
  ) {}

  async findAll(): Promise<ListFindAllResult> {
    const result = await this.listsRepository.findAndCount();
    return { lists: result[0], total: result[1] };
  }

  async findOne(id: number): Promise<List> {
    const list = await this.listsRepository.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }
    return list;
  }

  async create(createListDto: CreateListDto): Promise<List> {
    const list = this.listsRepository.create(createListDto);
    return this.listsRepository.save(list);
  }

  async update(id: number, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);
    this.listsRepository.merge(list, updateListDto);
    return this.listsRepository.save(list);
  }

  async remove(id: number): Promise<void> {
    const list = await this.findOne(id);
    await this.listsRepository.remove(list);
  }
}
