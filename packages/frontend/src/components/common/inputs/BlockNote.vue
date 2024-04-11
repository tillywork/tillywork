<script lang="ts">
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from '@blocknote/react';
import { applyPureReactInVue } from 'veaury';
import "@blocknote/react/style.css";
import "@blocknote/core/fonts/inter.css";
import { useThemeStore } from "@/stores/theme";

export default {
  components: {
    BlockNoteView: applyPureReactInVue(BlockNoteView)
  },
  setup() {
    const themeStore = useThemeStore();
    const editor = BlockNoteEditor.create({  });

    return {
      editor,
      themeStore
    }
  }
}
</script>

<template>
  <BlockNoteView :editor="editor" :theme="themeStore.theme" />
</template>

