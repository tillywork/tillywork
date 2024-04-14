import { Module } from "@nestjs/common";
import { ContactsModule } from "./contacts/contacts.module";
import { NotesModule } from "./notes/notes.module";

@Module({
    imports: [
        ContactsModule,
        NotesModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class CRMModule {}
