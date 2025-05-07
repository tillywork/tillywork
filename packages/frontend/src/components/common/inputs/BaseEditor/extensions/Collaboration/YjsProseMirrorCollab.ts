import { Extension } from '@tiptap/core';

import type * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { ySyncPlugin, yUndoPlugin } from 'y-prosemirror';

import { assertNotNullOrUndefined } from '@tillywork/shared';
import { yjsProseMirrorCursor } from './YjsProseMirrorCursor';

export interface YjsProsemirrorCollabOptions {
  yXmlFragment: Y.XmlFragment | null;
  awareness: Awareness | null;
}

export const YjsProsemirrorCollab =
  Extension.create<YjsProsemirrorCollabOptions>({
    name: 'yjsProsemirrorCollab',

    addOptions() {
      return {
        yXmlFragment: null,
        awareness: null,
      };
    },

    addProseMirrorPlugins() {
      assertNotNullOrUndefined(this.options.yXmlFragment, 'yXmlFragment');
      assertNotNullOrUndefined(this.options.awareness, 'awareness');

      return [
        ySyncPlugin(this.options.yXmlFragment),
        yjsProseMirrorCursor(this.options.awareness),
        yUndoPlugin(),
      ];
    },
  });
