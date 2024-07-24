import { Extension } from '@tiptap/vue-3';

export const CustomKeymap = Extension.create({
  name: 'customKeymap',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        // Prevent default behavior
        return true;
      },
    };
  },
});
