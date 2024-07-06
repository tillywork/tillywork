import { Node, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import BaseEditorImage from './BaseEditorImage.vue';

export interface ImageOptions {
  inline: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return [{ tag: 'image' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['image', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(BaseEditorImage);
  },
});
