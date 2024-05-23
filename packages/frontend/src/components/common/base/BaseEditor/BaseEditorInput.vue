<script setup lang="ts">
import { useEditor, EditorContent, Editor, type Content } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import type { Ref } from 'vue';
import { onBeforeUnmount, watch } from 'vue';
import Placeholder from '@tiptap/extension-placeholder';
import { NoNewLine } from './extensions/NoNewLine';
import { computed } from 'vue';
import { Commands } from './extensions/Commands';
import suggestion from './extensions/suggestion';

const props = defineProps<{
  autofocus?: boolean;
  placeholder?: string;
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
  singleLine?: boolean;
  editable?: boolean;
  disableCommands?: boolean;
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

  if (!props.disableCommands) {
    extensions.push(
      Commands.configure({
        suggestion,
      })
    );
  }

  return extensions;
});

const textValue = defineModel<string>();
const htmlValue = defineModel<Content>('html');
const jsonValue = defineModel<Content>('json');
const isEmpty = defineModel<boolean>('empty');

let editor: Ref<Editor | undefined>;

/**
 * Initializes the editor instance.
 */
function initEditor() {
  editor = useEditor({
    extensions: extensions.value,
    autofocus: props.autofocus,
    editable: props.editable,
    injectCSS: false,
    onCreate: () => {
      enforceHeading();
      fillEditorFromModelValues();
      isEmpty.value = editor.value?.isEmpty;
    },
    onUpdate: () => {
      enforceHeading();
      textValue.value = editor.value?.getText();
      htmlValue.value = editor.value?.getHTML();
      jsonValue.value = editor.value?.getJSON();
      isEmpty.value = editor.value?.isEmpty;
    },
  });
}

/**
 * Fills the initial content of the editor
 * from the v-model values when the editor
 * is created. Priority: Text -> HTML -> JSON
 */
function fillEditorFromModelValues() {
  if (textValue.value) {
    setEditorText(textValue.value);
  } else if (htmlValue.value || jsonValue.value) {
    editor.value?.commands.setContent(
      (htmlValue.value ?? jsonValue.value) as Content,
      true
    );
  }
}

/**
 * Simpler syntax for updating the editor value
 * when you only want a single-line string
 * @param text
 */
function setEditorText(text: string) {
  editor.value?.commands.setContent(
    [
      {
        attrs: props.heading ? { level: props.heading } : undefined,
        type: props.heading ? 'heading' : 'paragraph',
        content: [
          {
            text,
            type: 'text',
          },
        ],
      },
    ],
    true
  );
}

function destroyEditor() {
  editor.value?.destroy();
}

/**
 * Used for title inputs, where we want
 * the styling to be fixed as a heading,
 * and usually single-line.
 */
function enforceHeading() {
  if (
    props.heading &&
    !editor.value?.isActive('heading', { level: props.heading })
  ) {
    editor.value?.chain().focus().toggleHeading({ level: props.heading }).run();
  }
}

// Watch for changes to textValue and update the editor content
watch(textValue, (newText) => {
  if (editor.value && newText !== editor.value.getText()) {
    editor.value.commands.setContent(
      [
        {
          type: props.heading ? 'heading' : 'paragraph',
          attrs: { level: props.heading ? props.heading : undefined },
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
    editor.value.commands.setContent(newHtml as string, true);
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

initEditor();
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
