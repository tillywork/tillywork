import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import emojiSuggestions, { emojis } from './emojiSuggestions';
import { PluginKey } from '@tiptap/pm/state';

export const Emoji = Node.create({
  name: 'emoji',

  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-emoji]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-emoji': node.attrs.name,
        class: 'emoji',
      }),
      node.attrs.name,
    ];
  },

  addInputRules() {
    return [
      new InputRule({
        find: /:([a-zA-Z0-9_]+):$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const emojiName = match[1];

          if (emojis[emojiName]) {
            tr.replaceWith(
              range.from,
              range.to,
              this.type.create({ name: emojis[emojiName] })
            );
          }

          return;
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('emoji'),
        editor: this.editor,
        ...emojiSuggestions,
      }),
    ];
  },
});
