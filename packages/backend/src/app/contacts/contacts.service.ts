import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create.contact.dto';
import { UpdateContactDto } from './dto/update.contact.dto';
// Add imports for DTOs etc.

export type ContactsFindAllResult = {
    total: number;
    contacts: Contact[];
};

@Injectable()
export class ContactsService {
    private logger = new Logger('ContactsService');
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>
    ) { }

    async findAll({
        projectId,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    }: { projectId?: number, page?: number, limit?: number, sortBy?: string, sortOrder?: string }): Promise<ContactsFindAllResult> {
        const skip = (page - 1) * limit;
        const take = limit != -1 ? limit : undefined;

        const result = await this.contactRepository.findAndCount({
            where: {
                project: {
                    id: projectId,
                },
            },
            relations: ['owner'],
            skip,
            take,
            order: {
                [sortBy]: sortOrder,
            }
        });
    
        return { contacts: result[0], total: result[1] }; 
    }

    async findOne(id: number): Promise<Contact> {
        const contact = await this.contactRepository.findOne({
            where: { id },
            relations: ['owner', 'interactionHistory'],
        });
        if (!contact) {
            throw new NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const contact = this.contactRepository.create(createContactDto);
        return this.contactRepository.save(contact);
    }

    async update(
        id: number,
        updateContactDto: UpdateContactDto
    ): Promise<Contact> {
        const contact = await this.findOne(id);
        this.contactRepository.merge(contact, updateContactDto);
        return this.contactRepository.save(contact);
    }

    async remove(id: number): Promise<void> {
        const contact = await this.findOne(id);
        await this.contactRepository.remove(contact);
    }
}
