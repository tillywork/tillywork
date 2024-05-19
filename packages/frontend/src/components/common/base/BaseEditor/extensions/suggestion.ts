/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseEditorCommands from '../BaseEditorCommands.vue';
import { VueRenderer, Editor, type Range } from '@tiptap/vue-3';
import tippy from 'tippy.js';

export default {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Heading 1',
        icon: 'mdi-format-header-1',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run();
        },
      },
      {
        title: 'Heading 2',
        icon: 'mdi-format-header-2',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run();
        },
      },
      {
        title: 'Heading 3',
        icon: 'mdi-format-header-3',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run();
        },
      },
      {
        title: 'Bold',
        icon: 'mdi-format-bold',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setMark('bold').run();
        },
      },
      {
        title: 'Italic',
        icon: 'mdi-format-italic',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setMark('italic').run();
        },
      },
    ]
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  },

  render: () => {
    let component: BaseEditorCommands;
    let popup: any;

    return {
      onStart: (props: any) => {
        // Don't show user text in suggestions dropdown
        props.text = undefined;
        component = new VueRenderer(BaseEditorCommands, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        // Don't show user text in suggestions dropdown
        props.text = undefined;
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();

          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
