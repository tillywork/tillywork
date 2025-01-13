import { Node, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import BaseEditorImage from './BaseEditorImage.vue';
import { PluginKey, Plugin } from '@tiptap/pm/state';

export interface ImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: {
        src: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

export const inputRegex =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      height: {
        default: null,
      },
      width: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [src, width, height] = match;
          return { src, width, height };
        },
      }),
    ];
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(BaseEditorImage);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('image'),
        props: {
          handleDOMEvents: {
            copy(view, event) {
              const { state } = view;
              const { selection } = state;
              const selectedNode = (selection as any).node;

              if (selectedNode && selectedNode.type.name === 'image') {
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                  return false;
                }

                const imageData = JSON.stringify({
                  type: 'image',
                  attrs: selectedNode.attrs,
                });

                clipboardData.clearData();
                clipboardData.setData('application/x-prosemirror', imageData);
                clipboardData.setData('text/plain', imageData); // fallback for Chrome

                event.preventDefault();
              }

              return false;
            },
            paste(view, event) {
              const clipboardData = event.clipboardData;
              if (!clipboardData) {
                return false;
              }

              const content =
                clipboardData.getData('application/x-prosemirror') ||
                clipboardData.getData('text/plain'); // fallback for Chrome

              if (content) {
                const imageNode = JSON.parse(content);
                if (imageNode.type === 'image') {
                  const { state, dispatch } = view;
                  const { tr, schema } = state;
                  const node = schema.nodes.image.create(imageNode.attrs);
                  const insertPosition = state.selection.$to.pos;

                  const transaction = tr.insert(insertPosition, node);
                  dispatch(transaction);
                  event.preventDefault();
                  return true;
                }
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});
