import { PluginKey, Plugin } from '@tiptap/pm/state';
import { Node } from '@tiptap/core';
import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import PlaceholderChip from './PlaceholderChip.vue';

export interface PlaceholderOptions {
  HTMLAttributes: Record<string, any>;
}

export interface PlaceholderItem {
  placeholderPath: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    placeholder: {
      setPlaceholder: (options: PlaceholderItem) => ReturnType;
    };
  }
}

export const PlaceholderNode = Node.create<PlaceholderOptions>({
  name: 'placeholder',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      placeholderPath: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-placeholder]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            placeholderPath: element.getAttribute('data-placeholder-path'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-placeholder': '',
        'data-placeholder-path': HTMLAttributes.placeholderPath,
      }),
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(PlaceholderChip);
  },

  addCommands() {
    return {
      setPlaceholder:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const type = this.type;

    const autoReplacePlugin = new Plugin({
      key: new PluginKey('placeholderAutoreplace'),

      view(view) {
        const { state } = view;
        const tr = state.tr;
        let modified = false;

        state.doc.descendants((node, pos, parent) => {
          if (!node.isText || !parent) return;
          const text = node.text || '';
          const regex = /\{\{([^}]+)\}\}/g;
          let match;
          const nodes = [];
          let lastIndex = 0;

          while ((match = regex.exec(text)) !== null) {
            const placeholderPath = match[0];

            if (match.index > lastIndex) {
              nodes.push(state.schema.text(text.slice(lastIndex, match.index)));
            }

            nodes.push(type.create({ placeholderPath }));
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < text.length) {
            nodes.push(state.schema.text(text.slice(lastIndex)));
          }

          if (nodes.length > 0) {
            tr.replaceWith(pos, pos + node.nodeSize, nodes);
            modified = true;
          }
        });

        if (modified) {
          view.dispatch(tr);
        }

        return {};
      },
    });

    return [autoReplacePlugin];
  },
});
