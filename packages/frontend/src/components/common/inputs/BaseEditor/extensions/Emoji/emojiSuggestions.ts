import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import EmojiList from './EmojiList.vue';
import emojiNameMap from 'emoji-name-map';
import stringUtils from '@/utils/string';

export const emojis: Record<string, string> = emojiNameMap.emoji;

const emojiSuggestions = {
  char: ':',
  startOfLine: false,
  decorationTag: 'span',
  decorationClasses: ['emoji-suggestion'],
  items: ({ query }: { query: string }) => {
    return Object.keys(emojis)
      .filter((name) => stringUtils.fuzzySearch(query, name))
      .map((name) => ({ name, emoji: emojis[name] }))
      .slice(0, 100);
  },
  render: () => {
    let component: VueRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        props.text = null;

        component = new VueRenderer(EmojiList, {
          props,
          editor: props.editor,
        });

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
        props.text = null;

        component.updateProps(props);

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

export default emojiSuggestions;
