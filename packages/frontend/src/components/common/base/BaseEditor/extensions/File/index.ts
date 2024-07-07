import { Node, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import BaseEditorFile from './BaseEditorFile.vue';
import { Plugin, PluginKey } from '@tiptap/pm/state';

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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('file'),
        props: {
          handleDOMEvents: {
            copy(view, event) {
              const { state } = view;
              const { selection } = state;
              const selectedNode = (selection as any).node;

              if (selectedNode && selectedNode.type.name === 'file') {
                const clipboardData = event.clipboardData;
                if (!clipboardData) {
                  return false;
                }

                clipboardData.clearData();
                clipboardData.setData(
                  'application/x-prosemirror',
                  JSON.stringify({
                    type: 'file',
                    attrs: selectedNode.attrs,
                  })
                );
                event.preventDefault();
              }

              return false;
            },
            paste(view, event) {
              const clipboardData = event.clipboardData;
              if (!clipboardData) {
                return false;
              }

              const content = clipboardData.getData(
                'application/x-prosemirror'
              );

              if (content) {
                const fileNode = JSON.parse(content);
                if (fileNode.type === 'file') {
                  const { state, dispatch } = view;
                  const { tr, schema } = state;
                  const node = schema.nodes.file.create(fileNode.attrs);
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
