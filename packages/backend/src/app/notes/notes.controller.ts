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
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";
import { CreateNoteDto } from "./dto/create.note.dto";
import { Note } from "./note.entity";
import { NotesFindAllResult, NotesService } from "./notes.service";

@UseGuards(JwtAuthGuard)
@Controller({
    path: "notes",
    version: "1",
})
export class NotesController {
    private logger = new Logger("NotesController");
    constructor(private readonly notesService: NotesService) {}

    @Get("contacts/:id")
    findAll(
        @Param("id") id: number,
        @Query() query
    ): Promise<NotesFindAllResult> {
        return this.notesService.findAll({
            contactId: id,
            page: +query.page,
            limit: +query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
    }

    @Post()
    create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
        return this.notesService.create(createNoteDto);
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<Note> {
        return this.notesService.findOne(id);
    }

    @Put(":id")
    update(
        @Param("id") id: number,
        @Body() updateNoteDto: CreateNoteDto
    ): Promise<Note> {
        return this.notesService.update(id, updateNoteDto);
    }

    @Delete(":id")
    remove(@Param("id") id: number): Promise<void> {
        return this.notesService.remove(id);
    }
}
