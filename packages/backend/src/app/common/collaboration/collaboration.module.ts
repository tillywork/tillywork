import { forwardRef, Module } from "@nestjs/common";
import { YjsPersistenceService } from "./yjs.persistence.service";
import { SocketModule } from "../sockets/socket.module";

@Module({
    imports: [forwardRef(() => SocketModule)],
    controllers: [],
    providers: [YjsPersistenceService],
    exports: [YjsPersistenceService],
})
export class CollaborationModule {}
