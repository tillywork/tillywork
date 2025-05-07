import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { useSocket } from './useSocket';
import type { Socket } from 'socket.io-client';
import { assertNotNullOrUndefined } from '@tillywork/shared';
import { useAuthStore } from '@/stores/auth';
import colors from 'vuetify/util/colors';

interface EditorUpdatePayload {
  cardId: string;
  update: string;
}

const COLORS = Object.values(colors).map((color) => [color.base]);

export class YjsSocketProvider {
  public doc: Y.Doc;
  public yXmlFragment: Y.XmlFragment;
  public awareness: awarenessProtocol.Awareness;
  private cardId: string | null = null;
  private room: string | null = null;
  private socket: Socket | null = null;
  private isApplyingRemoteUpdate = false;

  constructor(cardId: string, cb?: () => void) {
    const { user } = storeToRefs(useAuthStore());
    const { socket } = useSocket();

    assertNotNullOrUndefined(socket, 'socket');
    assertNotNullOrUndefined(user.value, 'user.value');

    const userName = `${user.value.firstName} ${user.value.lastName}`;
    const colorIndex = this.hashStringToColorIndex(userName);
    const userColor = COLORS[colorIndex];

    this.cardId = cardId;
    this.room = `card:${cardId}`;
    this.socket = socket;

    this.doc = new Y.Doc();
    this.yXmlFragment = this.doc.getXmlFragment('prosemirror');

    this.awareness = new awarenessProtocol.Awareness(this.doc);
    this.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    });

    this.joinRoom();
    this.setupSocketListeners(cb);
  }

  destroy(): void {
    if (this.socket && this.cardId) {
      this.socket.emit('card:leave', { cardId: this.cardId });
    }

    this.awareness.destroy();
    this.doc.destroy();
  }

  private joinRoom() {
    assertNotNullOrUndefined(this.socket, 'socket');
    assertNotNullOrUndefined(this.cardId, 'cardId');

    this.socket.emit('card:join', {
      cardId: this.cardId,
    });
  }

  private setupSocketListeners(cb?: () => void) {
    assertNotNullOrUndefined(this.socket, 'socket');

    this.socket.on('card:sync', (stateUpdate: string) => {
      this.isApplyingRemoteUpdate = true;

      try {
        const update = toUint8Array(stateUpdate);
        Y.applyUpdate(this.doc, update, 'card:sync');
      } finally {
        this.isApplyingRemoteUpdate = false;

        if (cb) {
          cb();
        }
      }
    });

    this.socket.on('card:update', (data: EditorUpdatePayload) => {
      if (data.cardId !== this.cardId) {
        throw new Error("Received cardId doesn't match provider cardId");
      }

      this.isApplyingRemoteUpdate = true;

      try {
        const updateUint8 = toUint8Array(data.update);
        Y.applyUpdate(this.doc, updateUint8);
      } finally {
        this.isApplyingRemoteUpdate = false;
      }
    });

    this.socket.on(
      'awareness:update',
      (data: { room: string; update: string }) => {
        if (data.room !== this.room) {
          throw new Error("Received room doesn't match provider room");
        }

        awarenessProtocol.applyAwarenessUpdate(
          this.awareness,
          toUint8Array(data.update),
          null
        );
      }
    );

    this.doc.on('update', (update: Uint8Array) => {
      if (this.isApplyingRemoteUpdate) {
        return;
      }
      assertNotNullOrUndefined(this.socket, 'socket');
      assertNotNullOrUndefined(this.cardId, 'cardId');

      const base64Update = fromUint8Array(update);
      this.socket.emit('card:update', {
        cardId: this.cardId,
        update: base64Update,
      });
    });

    this.awareness.on(
      'update',
      ({
        added,
        updated,
        removed,
      }: {
        added: number[];
        updated: [];
        removed: number[];
      }) => {
        const changedClients = added.concat(updated).concat(removed);
        const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          changedClients
        );

        this.socket?.emit('awareness:update', {
          room: this.room,
          update: fromUint8Array(awarenessUpdate),
        });
      }
    );

    this.socket.on('disconnect', () => {
      assertNotNullOrUndefined(this.socket, 'socket');

      this.socket.off('card:sync');
      this.socket.off('card:update');
    });
  }

  private hashStringToColorIndex(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    return Math.abs(hash) % COLORS.length;
  }
}
