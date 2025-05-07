import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { TillyLogger } from "../logger/tilly.logger";

import { ClsService } from "nestjs-cls";
import { YjsPersistenceService } from "../collaboration/yjs.persistence.service";
import { CardsService } from "./cards.service";

import { Server, Socket } from "socket.io";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { Schema } from "prosemirror-model";
import { yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";

import { fromUint8Array, toUint8Array } from "js-base64";

import { JSONContent } from "@tiptap/core";
import { assertNotNullOrUndefined, editorSchema } from "@tillywork/shared";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class CardsGateway {
    @WebSocketServer()
    server: Server;

    private docs = new Map<string, Y.Doc>();
    private socketToRoom = new Map<string, string>();
    private awarenessStates = new Map<string, awarenessProtocol.Awareness>();
    private saveTimers = new Map<
        string,
        { timer: NodeJS.Timeout; latestContent: any }
    >();

    private readonly logger = new TillyLogger("CardsGateway");
    private readonly SAVE_DEBOUNCE_MS = 1000 * 2;

    constructor(
        private readonly yjsPersistenceService: YjsPersistenceService,
        private readonly cardsService: CardsService,
        private readonly clsService: ClsService
    ) {}

    @SubscribeMessage("card:join")
    async onJoin(
        @MessageBody() data: { cardId: number },
        @ConnectedSocket() client: Socket
    ) {
        const room = `card:${data.cardId}`;
        client.join(room);

        let doc = this.docs.get(room);
        if (!doc) {
            doc = await this.yjsPersistenceService.loadDocument(room);
            if (!doc) {
                doc = new Y.Doc();
            }
            this.docs.set(room, doc);
        }

        let awareness = this.awarenessStates.get(room);
        if (!awareness) {
            awareness = new awarenessProtocol.Awareness(doc);
            this.awarenessStates.set(room, awareness);
        }

        awareness.setLocalState(null);
        client.on(
            "awareness:update",
            (data: { room: string; update: string }) => {
                if (data.room !== room) return;

                const update = toUint8Array(data.update);
                awarenessProtocol.applyAwarenessUpdate(
                    awareness,
                    update,
                    client.id
                );

                client.to(room).emit("awareness:update", {
                    room,
                    update: data.update,
                });
            }
        );

        const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            Array.from(awareness.getStates().keys())
        );
        client.emit("awareness:update", {
            room,
            update: fromUint8Array(awarenessUpdate),
        });

        const state = fromUint8Array(Y.encodeStateAsUpdate(doc));
        client.emit("card:sync", state);
    }

    @SubscribeMessage("card:leave")
    async onLeave(
        @MessageBody() data: { cardId: number },
        @ConnectedSocket() client: Socket
    ) {
        const { cardId } = data;
        const room = `card:${cardId}`;
        const awareness = this.awarenessStates.get(room);

        client.leave(`card:${cardId}`);
        this.socketToRoom.delete(client.id);

        if (awareness) {
            awareness.getStates().delete(Number(client.id));
            const update = awarenessProtocol.encodeAwarenessUpdate(awareness, [
                Number(client.id),
            ]);

            this.server.to(room).emit("awareness:update", {
                room,
                update: fromUint8Array(update),
            });
        }
    }

    @SubscribeMessage("card:update")
    async onUpdate(
        @MessageBody() data: { cardId: string; update: string },
        @ConnectedSocket() client: Socket
    ) {
        const { cardId, update } = data;
        const doc = this.docs.get(`card:${cardId}`);
        assertNotNullOrUndefined(doc, "doc");

        const updateUint8 = toUint8Array(update);

        Y.applyUpdate(doc, updateUint8);
        await this.yjsPersistenceService.saveDocument(`card:${cardId}`, doc);

        client.to(`card:${cardId}`).emit("card:update", {
            cardId,
            update,
        });

        const yXmlFragment = doc.getXmlFragment("prosemirror");
        const json = this.yXmlFragmentToJSON(yXmlFragment);

        this.clsService.enter();
        this.clsService.set("user", client.data.user);
        this.debounceSave(cardId, json);
    }

    async handleDisconnect(client: Socket) {
        const room = this.socketToRoom.get(client.id);
        if (!room) return;

        const awareness = this.awarenessStates.get(room);
        if (awareness) {
            awareness.getStates().delete(Number(client.id));

            const update = awarenessProtocol.encodeAwarenessUpdate(awareness, [
                Number(client.id),
            ]);

            this.server.to(room).emit("awareness:update", {
                room,
                update: fromUint8Array(update),
            });
        }

        this.socketToRoom.delete(client.id);
    }

    private yXmlFragmentToJSON(yXmlFragment: Y.XmlFragment) {
        const schema = new Schema(editorSchema);
        const pmNode = yXmlFragmentToProseMirrorRootNode(yXmlFragment, schema);

        return pmNode.toJSON();
    }

    private debounceSave(cardId: string, jsonContent: JSONContent) {
        const existing = this.saveTimers.get(cardId);
        if (existing) {
            clearTimeout(existing.timer);
        }

        const timer = setTimeout(async () => {
            try {
                await this.cardsService.updateCardDescription(
                    +cardId,
                    jsonContent
                );
            } catch (err) {
                this.logger.error(`Failed to save card ${cardId}`, err);
            } finally {
                this.saveTimers.delete(cardId);
            }
        }, this.SAVE_DEBOUNCE_MS);

        this.saveTimers.set(cardId, { timer, latestContent: jsonContent });
    }
}
