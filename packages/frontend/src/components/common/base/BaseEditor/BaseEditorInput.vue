<script setup lang="ts">
import { useEditor, EditorContent, Editor, type Content } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { NoNewLine } from './extensions/NoNewLine';
import { Commands } from './extensions/Commands';
import suggestion from './extensions/Commands/suggestions';
import { Indent } from './extensions/Indent';
import { TextDirection } from './extensions/TextDirection';
import { Codeblock } from './extensions/Codeblock';
import { Underline } from '@tiptap/extension-underline';

const props = defineProps<{
  autofocus?: boolean;
  placeholder?: string;
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
  singleLine?: boolean;
  editable?: boolean;
  disableCommands?: boolean;
}>();

const extensions = computed(() => {
  const extensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    TextDirection.configure({
      types: ['heading', 'paragraph', 'listItem'],
    }),
    Codeblock,
    Underline,
  ];

  if (props.singleLine) {
    extensions.push(NoNewLine);
  } else {
    extensions.push(Indent);
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

.tiptap {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 24px;
  }

  /* Placeholder (at the top) */
  .is-empty:first-child::before,
  .is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
  }

  p[dir='rtl'],
  h1[dir='rtl'],
  h2[dir='rtl'],
  h3[dir='rtl'],
  h4[dir='rtl'],
  h5[dir='rtl'],
  h6[dir='rtl'] {
    text-align: right;
  }

  p[dir='ltr'],
  h1[dir='ltr'],
  h2[dir='ltr'],
  h3[dir='ltr'],
  h4[dir='ltr'],
  h5[dir='ltr'],
  h6[dir='ltr'] {
    text-align: left;
  }

  pre {
    background: #101112;
    color: #fff;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }

    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }

  :not(pre) code {
    background: #101112;
    color: #fff;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
    font-size: 0.8rem;
  }

  blockquote {
    padding-inline-start: 1rem;
    border-inline-start: 3px solid rgba(#0d0d0d, 0.1);
  }
}
</style>
