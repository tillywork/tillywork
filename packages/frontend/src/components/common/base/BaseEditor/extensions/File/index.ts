import { Node, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import BaseEditorFile from './BaseEditorFile.vue';

export interface FileOptions {
  inline: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    file: {
      setFile: (options: { url: string }) => ReturnType;
    };
  }
}

export const inputRegex =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const File = Node.create<FileOptions>({
  name: 'file',

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
      id: {
        default: null,
      },
      name: {
        default: null,
        isRequired: true,
      },
      url: {
        default: null,
        isRequired: true,
      },
      size: {
        default: null,
      },
      createdBy: {
        default: null,
      },
      createdAt: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setFile:
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
          const [id, name, url, size, createdBy, createdAt] = match;
          return { id, name, url, size, createdBy, createdAt };
        },
      }),
    ];
  },

  parseHTML() {
    return [{ tag: 'file' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['file', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(BaseEditorFile);
  },
});
