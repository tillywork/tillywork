import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { ySyncPluginKey } from 'y-prosemirror';

import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
} from 'y-prosemirror';

export const yCursorPluginKey = new PluginKey('yjs-prosemirror-cursor');

export type AwarenessUser = {
  name: string;
  color: string;
};

/**
 * Default awareness state filter (same as original y-prosemirror plugin)
 */
const awarenessStateFilter = (
  currentClientId: number,
  userClientId: number,
  _user: AwarenessUser
) => currentClientId !== userClientId;

/**
 * Custom cursor builder function with Vuetify styling
 */
const customCursorBuilder = (user: AwarenessUser) => {
  const cursor = document.createElement('span');
  cursor.classList.add('ProseMirror-yjs-cursor', 'ProseMirror-widget');
  cursor.setAttribute('style', `border-color: transparent`);
  cursor.style.borderLeft = `2px solid ${user.color}`;

  const cursorEdge = document.createElement('span');
  cursorEdge.classList.add('yjs-cursor-edge');
  cursorEdge.style.borderRight = `3px solid ${user.color}`;
  cursorEdge.style.backgroundColor = user.color;

  cursor.insertBefore(cursorEdge, null);

  // Add the username label
  const userDiv = document.createElement('div');
  userDiv.setAttribute('style', `background-color: ${user.color}`);
  userDiv.insertBefore(document.createTextNode(user.name), null);

  const nonbreakingSpace1 = document.createTextNode('\u2060');
  const nonbreakingSpace2 = document.createTextNode('\u2060');
  cursor.insertBefore(nonbreakingSpace1, null);
  cursor.insertBefore(userDiv, null);
  cursor.insertBefore(nonbreakingSpace2, null);

  return cursor;
};

/**
 * Custom selection builder (same as original with Vuetify class)
 */
const customSelectionBuilder = (user: AwarenessUser) => {
  return {
    style: `background-color: ${user.color}70`,
    class: 'ProseMirror-yjs-selection v-custom-cursor-selection',
  };
};

/**
 * Create the decorations for rendering cursors (based on original implementation)
 */
const createDecorations = (
  state: any,
  awareness: Awareness,
  awarenessFilter: (
    currentClientId: number,
    userClientId: number,
    user: AwarenessUser
  ) => boolean,
  createCursor: (user: AwarenessUser, clientId: number) => HTMLElement,
  createSelection: (user: AwarenessUser, clientId: number) => any
) => {
  const ystate = ySyncPluginKey.getState(state);
  const y = ystate.doc;
  const decorations: Decoration[] = [];

  // Do not render cursors while snapshot is active
  if (
    ystate.snapshot != null ||
    ystate.prevSnapshot != null ||
    ystate.binding.mapping.size === 0
  ) {
    return DecorationSet.create(state.doc, []);
  }

  awareness.getStates().forEach((aw: any, clientId: number) => {
    if (!awarenessFilter(y.clientID, clientId, aw)) {
      return;
    }

    if (aw.cursor != null) {
      const user = aw.user || {};
      if (user.color == null) {
        user.color = '#ffa500';
      }
      if (user.name == null) {
        user.name = `User: ${clientId}`;
      }

      let anchor = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.anchor),
        ystate.binding.mapping
      );

      let head = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.head),
        ystate.binding.mapping
      );

      if (anchor !== null && head !== null) {
        const maxsize = Math.max(state.doc.content.size - 1, 0);
        anchor = Math.min(anchor, maxsize);
        head = Math.min(head, maxsize);

        // Add cursor widget
        decorations.push(
          Decoration.widget(head, () => createCursor(user, clientId), {
            key: clientId + '',
            side: 10,
          })
        );

        // Add selection highlighting
        const from = Math.min(anchor, head);
        const to = Math.max(anchor, head);
        decorations.push(
          Decoration.inline(from, to, createSelection(user, clientId), {
            inclusiveEnd: true,
            inclusiveStart: false,
          })
        );
      }
    }
  });

  return DecorationSet.create(state.doc, decorations);
};

/**
 * Custom cursor plugin based on the original y-prosemirror cursor plugin
 */
export const yjsProseMirrorCursor = (awareness: Awareness) => {
  return new Plugin({
    key: yCursorPluginKey,

    state: {
      init(_, state) {
        return createDecorations(
          state,
          awareness,
          awarenessStateFilter,
          customCursorBuilder,
          customSelectionBuilder
        );
      },

      apply(tr, prevState, _oldState, newState) {
        const ystate = ySyncPluginKey.getState(newState);
        const yCursorState = tr.getMeta(yCursorPluginKey);

        if (
          (ystate && ystate.isChangeOrigin) ||
          (yCursorState && yCursorState.awarenessUpdated)
        ) {
          return createDecorations(
            newState,
            awareness,
            awarenessStateFilter,
            customCursorBuilder,
            customSelectionBuilder
          );
        }

        return prevState.map(tr.mapping, tr.doc);
      },
    },

    props: {
      decorations: (state) => {
        return yCursorPluginKey.getState(state);
      },
    },

    view: (view) => {
      const awarenessListener = () => {
        if (!view) return;

        requestAnimationFrame(() => {
          const tr = view.state.tr.setMeta(yCursorPluginKey, {
            awarenessUpdated: true,
          });
          view.dispatch(tr);
        });
      };

      const updateCursorInfo = () => {
        const ystate = ySyncPluginKey.getState(view.state);
        const current = awareness.getLocalState() || {};

        if (view.hasFocus()) {
          const selection = view.state.selection;

          const anchor = absolutePositionToRelativePosition(
            selection.anchor,
            ystate.type,
            ystate.binding.mapping
          );

          const head = absolutePositionToRelativePosition(
            selection.head,
            ystate.type,
            ystate.binding.mapping
          );

          if (
            current.cursor == null ||
            !Y.compareRelativePositions(
              Y.createRelativePositionFromJSON(current.cursor.anchor),
              anchor
            ) ||
            !Y.compareRelativePositions(
              Y.createRelativePositionFromJSON(current.cursor.head),
              head
            )
          ) {
            awareness.setLocalStateField('cursor', {
              anchor,
              head,
            });
          }
        } else if (
          current.cursor != null &&
          relativePositionToAbsolutePosition(
            ystate.doc,
            ystate.type,
            Y.createRelativePositionFromJSON(current.cursor.anchor),
            ystate.binding.mapping
          ) !== null
        ) {
          // Remove cursor when editor loses focus
          awareness.setLocalStateField('cursor', null);
        }
      };

      // Set up event listeners
      awareness.on('change', awarenessListener);
      view.dom.addEventListener('focusin', updateCursorInfo);
      view.dom.addEventListener('focusout', updateCursorInfo);

      return {
        update: updateCursorInfo,
        destroy: () => {
          view.dom.removeEventListener('focusin', updateCursorInfo);
          view.dom.removeEventListener('focusout', updateCursorInfo);
          awareness.off('change', awarenessListener);
          awareness.setLocalStateField('cursor', null);
        },
      };
    },
  });
};
