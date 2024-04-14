import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { View } from './view.entity';
import { CreateViewDto } from './dto/create.view.dto';
import { UpdateViewDto } from './dto/update.view.dto';

export type ViewFindAllResult = {
  total: number;
  views: View[];
};

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(View)
    private viewsRepository: Repository<View>
  ) {}

  async findAll(): Promise<ViewFindAllResult> {
    const result = await this.viewsRepository.findAndCount();
    return { views: result[0], total: result[1] };
  }

  async findOne(id: number): Promise<View> {
    const view = await this.viewsRepository.findOne({ where: { id } });
    if (!view) {
      throw new NotFoundException(`View with ID ${id} not found`);
    }
    return view;
  }

  async create(createViewDto: CreateViewDto): Promise<View> {
    const view = this.viewsRepository.create(createViewDto);
    return this.viewsRepository.save(view);
  }

  async update(id: number, updateViewDto: UpdateViewDto): Promise<View> {
    const view = await this.findOne(id);
    this.viewsRepository.merge(view, updateViewDto);
    return this.viewsRepository.save(view);
  }

  async remove(id: number): Promise<void> {
    const view = await this.findOne(id);
    await this.viewsRepository.remove(view);
  }
}
