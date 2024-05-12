import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNoteDto } from "./dto/create.note.dto";
import { Note } from "./note.entity";

export type NotesFindAllResult = {
    total: number;
    notes: Note[];
};

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private noteRepository: Repository<Note>
    ) {}

    async findAll({
        contactId,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    }: {
        contactId?: number;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<NotesFindAllResult> {
        const skip = (page - 1) * limit;
        const take = limit != -1 ? limit : undefined;

        const result = await this.noteRepository.findAndCount({
            where: {
                entityId: contactId,
                deletedAt: null,
            },
            skip,
            take,
            order: {
                [sortBy]: sortOrder,
            },
        });

        return { notes: result[0], total: result[1] };
    }

    async findOne(id: number): Promise<Note> {
        const contact = await this.noteRepository.findOne({
            where: {
                id,
                deletedAt: null,
            },
            relations: ["owner", "interactionHistory"],
        });
        if (!contact) {
            throw new NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }

    async create(createNoteDto: CreateNoteDto): Promise<Note> {
        const contact = this.noteRepository.create(createNoteDto);
        return this.noteRepository.save(contact);
    }

    async update(id: number, updateNoteDto: CreateNoteDto): Promise<Note> {
        const note = await this.findOne(id);
        this.noteRepository.merge(note, updateNoteDto);
        return this.noteRepository.save(note);
    }

    async remove(id: number): Promise<void> {
        const note = await this.findOne(id);
        await this.noteRepository.softRemove(note);
    }
}
