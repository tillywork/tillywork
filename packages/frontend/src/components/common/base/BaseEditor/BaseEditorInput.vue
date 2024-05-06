<script setup lang="ts">
import { useEditor, EditorContent, Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import type { Ref } from 'vue';
import { onBeforeUnmount, watch } from 'vue';
import Placeholder from '@tiptap/extension-placeholder';
import { NoNewLine } from './extensions/NoNewLine';
import { computed } from 'vue';

const props = defineProps<{
  autofocus?: boolean;
  placeholder?: string;
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
  singleLine?: boolean;
}>();

const extensions = computed(() => {
  const extensions = [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ];

  if (props.singleLine) {
    extensions.push(NoNewLine);
  }

  return extensions;
});

const textValue = defineModel();
const htmlValue = defineModel('html');
const jsonValue = defineModel('json');

let editor: Ref<Editor | undefined>;

function initEditor() {
  editor = useEditor({
    content: [
      {
        attrs: { level: 3 },
        type: 'heading',
        content: [
          {
            text: textValue.value,
            type: 'text',
          },
        ],
      },
    ],
    extensions: extensions.value,
    autofocus: props.autofocus,
    editable: true,
    injectCSS: false,
    onCreate: () => {
      enforceHeading();
    },
    onUpdate: () => {
      enforceHeading();
      textValue.value = editor.value?.getText();
      htmlValue.value = editor.value?.getHTML();
      jsonValue.value = editor.value?.getJSON();
    },
  });
}

function destroyEditor() {
  editor.value?.destroy();
}

function enforceHeading() {
  if (
    props.heading &&
    !editor.value?.isActive('heading', { level: props.heading })
  ) {
    editor.value?.chain().focus().toggleHeading({ level: props.heading }).run();
  }
}

initEditor();

// Watch for changes to textValue and update the editor content
watch(textValue, (newText) => {
  if (editor.value && newText !== editor.value.getText()) {
    editor.value.commands.setContent(
      [
        {
          type: 'heading',
          attrs: { level: props.heading ?? 1 },
          content: [{ type: 'text', text: newText }],
        },
      ],
      true
    );
  }
});

// Watch for changes to htmlValue and update the editor content
watch(htmlValue, (newHtml) => {
  if (editor.value && newHtml !== editor.value.getHTML()) {
    editor.value.commands.setContent(newHtml as any, true);
  }
});

// Watch for changes to jsonValue and update the editor content
watch(jsonValue, (newJson) => {
  if (editor.value) {
    const currentJson = editor.value.getJSON();
    // Using JSON.stringify to compare JSON objects
    if (JSON.stringify(newJson) !== JSON.stringify(currentJson)) {
      editor.value.commands.setContent(newJson as any, true);
    }
  }
});

onBeforeUnmount(() => {
  destroyEditor();
});
</script>

<template>
  <editor-content :editor="editor" />
</template>

<style lang="scss">
.ProseMirror-focused {
  outline: none;
}

/* Placeholder (at the top) */
.tiptap .is-empty:first-child::before,
.tiptap .is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
