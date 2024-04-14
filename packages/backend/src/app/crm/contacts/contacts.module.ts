import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactsService } from "./contacts.service";
import { ContactsController } from "./contacts.controller";
import { Contact } from "./contact.entity";
import { NotesModule } from "../notes/notes.module";

@Module({
    imports: [TypeOrmModule.forFeature([Contact]), NotesModule],
    controllers: [ContactsController],
    providers: [ContactsService],
    exports: [ContactsService],
})
export class ContactsModule {}
