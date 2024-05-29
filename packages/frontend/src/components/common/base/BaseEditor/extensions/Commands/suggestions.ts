/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor, VueRenderer, type Range } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import BaseEditorCommands from './BaseEditorCommands.vue';

function getLeaderKey(): string {
  return navigator.userAgent.includes('Mac OS') ? 'Cmd' : 'Ctrl';
}

function getAlternativeKey(): string {
  return navigator.userAgent.includes('Mac OS') ? 'Option' : 'Alt';
}

export default {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Heading 1',
        icon: 'mdi-format-header-1',
        shortcut: `${getLeaderKey()} + ${getAlternativeKey()} + 1`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 1 })
            .run();
        },
      },
      {
        title: 'Heading 2',
        icon: 'mdi-format-header-2',
        shortcut: `${getLeaderKey()} + ${getAlternativeKey()} + 2`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 2 })
            .run();
        },
      },
      {
        title: 'Heading 3',
        icon: 'mdi-format-header-3',
        shortcut: `${getLeaderKey()} + ${getAlternativeKey()} + 3`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 3 })
            .run();
        },
      },
      {
        title: 'Bold',
        icon: 'mdi-format-bold',
        shortcut: `${getLeaderKey()} + B`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setBold().run();
        },
      },
      {
        title: 'Italic',
        icon: 'mdi-format-italic',
        shortcut: `${getLeaderKey()} + I`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setItalic().run();
        },
      },
      {
        title: 'Underline',
        icon: 'mdi-format-underline',
        shortcut: `${getLeaderKey()} + U`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setUnderline().run();
        },
      },
      {
        title: 'Strike',
        icon: 'mdi-format-strikethrough',
        shortcut: `${getLeaderKey()} + Shift X`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setStrike().run();
        },
      },
      {
        title: 'Blockquote',
        icon: 'mdi-format-quote-open',
        shortcut: `${getLeaderKey()} + Shift B`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setBlockquote().run();
        },
      },
      {
        title: 'Bullet List',
        icon: 'mdi-format-list-bulleted',
        shortcut: `${getLeaderKey()} + Shift 8`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Ordered List',
        icon: 'mdi-format-list-numbered',
        shortcut: `${getLeaderKey()} + Shift 7`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Code',
        icon: 'mdi-code-tags',
        shortcut: `${getLeaderKey()} + E`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setCode().run();
        },
      },
      {
        title: 'Code Block',
        icon: 'mdi-code-brackets',
        shortcut: `${getLeaderKey()} + ${getAlternativeKey()} + C`,
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setCodeBlock().run();
        },
      },
      {
        title: 'Horizontal Rule',
        icon: 'mdi-minus',
        command: ({ editor, range }: { editor: Editor; range: Range }) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
      },
    ]
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 20);
  },

  render: () => {
    let component: any;
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
