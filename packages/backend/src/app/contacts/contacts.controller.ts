import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    Delete,
    Put,
    Logger,
    UseGuards,
} from "@nestjs/common";
import { ContactsFindAllResult, ContactsService } from "./contacts.service";
import { Contact } from "./contact.entity";
import { CreateContactDto } from "./dto/create.contact.dto";
import { UpdateContactDto } from "./dto/update.contact.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CreateNoteDto } from "../notes/dto/create.note.dto";
import { Note } from "../notes/note.entity";
import { NotesService } from "../notes/notes.service";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "contacts",
    version: "1",
})
export class ContactsController {
    private logger = new Logger("ContactsController");
    constructor(
        private readonly contactsService: ContactsService,
        private readonly notesService: NotesService
    ) {}

    @Get()
    findAll(@Query() query): Promise<ContactsFindAllResult> {
        return this.contactsService.findAll({
            projectId: +query.projectId,
            page: +query.page,
            limit: +query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<Contact> {
        return this.contactsService.findOne(id);
    }

    @Post()
    create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
        this.logger.debug(createContactDto);
        return this.contactsService.create(createContactDto);
    }

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateContactDto: UpdateContactDto
    ): Promise<Contact> {
        return this.contactsService.update(id, updateContactDto);
    }

    @Delete(":id")
    remove(@Param("id") id: number): Promise<void> {
        return this.contactsService.remove(id);
    }

    @Post(":id/notes")
    createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
        return this.notesService.create(createNoteDto);
    }
}
