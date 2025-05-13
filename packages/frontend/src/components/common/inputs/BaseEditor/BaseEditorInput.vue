<script setup lang="ts">
import {
  useEditor,
  EditorContent,
  Editor,
  type Content,
  VueNodeViewRenderer,
  type JSONContent,
} from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Mention, type MentionOptions } from '@tiptap/extension-mention';
import type { SuggestionOptions } from '@tiptap/suggestion';

import { NoNewLine } from './extensions/NoNewLine';
import { Commands } from './extensions/Commands';
import suggestion from './extensions/Commands/suggestions';
import { Indent } from './extensions/Indent';
import { TextDirection } from './extensions/TextDirection';
import { Codeblock } from './extensions/Codeblock';
import { Image } from './extensions/Image';
import { FileHandler } from './extensions/FileHandler';
import { File } from './extensions/File';
import { TrailingNode } from './extensions/TrailingNode';
import { CustomKeymap } from './extensions/CustomKeymap';
import mentionSuggestions from './extensions/Mention/mentionSuggestions';
import MentionChip from './extensions/Mention/MentionChip.vue';
import { Emoji } from './extensions/Emoji';
import { YjsProsemirrorCollab } from './extensions/Collaboration';

import {
  TWFileType,
  useFilesService,
  type TWFile,
} from '@/services/useFilesService';

import { YjsSocketProvider } from '@/composables/useYjsSocketProvider';

import objectUtils from '@/utils/object';

const {
  autofocus = false,
  placeholder,
  heading,
  singleLine,
  editable = true,
  disableCommands,
  minHeight,
  enableCollaboration,
  docId,
} = defineProps<{
  autofocus?: boolean;
  placeholder?: string;
  heading?: number;
  singleLine?: boolean;
  editable?: boolean;
  disableCommands?: boolean;
  minHeight?: string | number;
  enableCollaboration?: boolean;
  docType?: string;
  docId?: string | number;
}>();

console.log('minHeight', minHeight);
const emit = defineEmits(['focus', 'blur', 'input']);

const { uploadFiles } = useFilesService();
const {
  open: openFileDialog,
  reset: resetFileDialog,
  onChange: onFilesChange,
} = useFileDialog({
  accept:
    '.pdf,.doc,.docx,.csv,.xls,.xlsx,image/jpeg,image/png,image/gif,application/zip,application/json',
});

let provider: YjsSocketProvider | null = null;
let editor: Ref<Editor | undefined>;

function buildExtensionsArray() {
  const extensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Placeholder.configure({
      placeholder,
    }),
    TextDirection.configure({
      types: ['heading', 'paragraph', 'listItem'],
    }),
    Codeblock,
    Underline,
    Image,
    FileHandler.configure({ uploadFn: uploadFiles }),
    File,
    Link.configure({
      defaultProtocol: 'https',
    }),
    CustomKeymap,
    Emoji,
  ];

  if (singleLine) {
    extensions.push(NoNewLine);
  } else {
    extensions.push(Indent);
  }

  if (!disableCommands) {
    extensions.push(
      Commands.configure({
        suggestion,
      })
    );
    extensions.push(
      Mention.extend({
        addNodeView() {
          return VueNodeViewRenderer(MentionChip);
        },
      }).configure({
        suggestion: mentionSuggestions as Omit<
          SuggestionOptions<MentionOptions['suggestion']>,
          'editor'
        >,
      })
    );
  }

  if (editable && !singleLine) {
    extensions.push(TrailingNode);
  }

  if (enableCollaboration && provider) {
    extensions.push(
      YjsProsemirrorCollab.configure({
        yXmlFragment: provider.yXmlFragment,
        awareness: provider.awareness,
      })
    );
  }

  return extensions;
}

const jsonValue = defineModel<Content>();
const textValue = defineModel<string>('text');
const htmlValue = defineModel<string>('html');
const isEmpty = defineModel<boolean>('empty');

/**
 * Initializes the editor instance.
 */
function initEditor() {
  editor = useEditor({
    extensions: buildExtensionsArray(),
    autofocus,
    editable,
    onCreate: () => {
      enforceHeading();
      if (!enableCollaboration) {
        fillEditorFromModelValues();
        isEmpty.value = editor.value?.isEmpty;
      }
    },
    onUpdate: () => {
      enforceHeading();

      if (!enableCollaboration) {
        textValue.value = editor.value?.getText() ?? '';
        jsonValue.value = editor.value?.getJSON();
        htmlValue.value = editor.value?.getHTML();
        isEmpty.value = editor.value?.isEmpty;
      }
      emit('input');
    },
    onFocus: (e) => {
      emit('focus', e.event);
    },
    onBlur: (e) => {
      emit('blur', e.event);
    },
  });
}

/**
 * Fills the initial content of the editor
 * from the v-model values when the editor
 * is created. Priority: Text -> JSON -> HTML
 */
function fillEditorFromModelValues() {
  if (!editor.value) return;

  if (enableCollaboration && provider) {
    const initialContent = jsonValue.value as JSONContent;
    const isYDocEmpty = provider.doc.getXmlFragment('prosemirror').length === 0;
    if (isYDocEmpty) {
      editor.value.commands.setContent(initialContent, false);
    }

    return;
  }

  if (textValue.value) {
    setEditorText(textValue.value);
  } else if (jsonValue.value) {
    editor.value.commands.setContent(jsonValue.value as Content, false);
  } else if (htmlValue.value) {
    editor.value.commands.setContent(htmlValue.value as Content, false);
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
        attrs: heading ? { level: heading } : undefined,
        type: heading ? 'heading' : 'paragraph',
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
  provider?.destroy();
}

function enforceHeading() {
  if (heading && !editor?.value?.isActive('heading', { level: heading })) {
    editor.value
      ?.chain()
      .focus()
      .toggleHeading({ level: heading as any })
      .run();
  }
}

function focusEditor() {
  if (!editor.value) {
    return;
  }

  editor.value.commands.focus();
}

// Watch for changes to textValue and update the editor content only if collaboration is disabled
watch(textValue, (newText) => {
  if (!enableCollaboration && editor && newText !== editor.value?.getText()) {
    editor.value?.commands.setContent(
      [
        {
          type: heading ? 'heading' : 'paragraph',
          attrs: { level: heading ? heading : undefined },
          content: [{ type: 'text', text: newText }],
        },
      ],
      true
    );
  }
});

// Watch for changes to jsonValue and update the editor content only if collaboration is disabled
watch(jsonValue, (newJson) => {
  if (!enableCollaboration && editor.value) {
    const currentJson = editor.value.getJSON();
    const areTheyEqual = objectUtils.isEqual(
      currentJson,
      newJson ?? ({} as any)
    );
    if (!areTheyEqual) {
      editor.value.commands.setContent(newJson as any, true);
    }
  }
});

// Watch for changes to htmlValue and update the editor content only if collaboration is disabled
watch(htmlValue, (newHtml) => {
  if (!enableCollaboration && editor.value) {
    const currentHtml = editor.value.getHTML();
    const areTheyEqual = currentHtml === newHtml;
    if (!areTheyEqual) {
      editor.value.commands.setContent(newHtml as any, true);
    }
  }
});

watch(
  () => docId,
  (newDocId, oldDocId) => {
    if (enableCollaboration && newDocId && newDocId !== oldDocId) {
      destroyEditor();

      provider = new YjsSocketProvider(`${newDocId}`, () => {
        initEditor();
        fillEditorFromModelValues();
        isEmpty.value = editor.value?.isEmpty;
      });
    }
  }
);

if (enableCollaboration && docId) {
  if (provider) {
    (provider as YjsSocketProvider).destroy();
    provider = null;
  }

  provider = new YjsSocketProvider(`${docId}`, () => {
    fillEditorFromModelValues();
    isEmpty.value = editor.value?.isEmpty;
  });
}

initEditor();

onBeforeUnmount(() => {
  destroyEditor();
});

onFilesChange(async (files) => {
  if (editor.value && files) {
    const fileArray = Array.from(files);
    const fileUploads = await uploadFiles(fileArray);

    fileUploads.forEach((file: TWFile) => {
      switch (file.type) {
        case TWFileType.IMAGE:
          editor.value
            ?.chain()
            .focus()
            .createParagraphNear()
            .insertContent({
              type: 'image',
              attrs: {
                src: file.url,
              },
            })
            .run();
          break;

        case TWFileType.FILE:
        default:
          editor.value
            ?.chain()
            .focus()
            .createParagraphNear()
            .insertContent({
              type: 'file',
              attrs: file,
            })
            .run();
          break;
      }
    });

    resetFileDialog();
  }
});

defineExpose({
  openFileDialog,
});
</script>

<template>
  <div class="editor-container cursor-text" @click="focusEditor">
    <editor-content
      :editor="editor"
      :style="{
        minHeight: `${minHeight}px`,
      }"
    />
  </div>
</template>

<style lang="scss">
.tiptap {
  line-height: 1.65;
  font-size: 0.9rem;

  > * {
    padding: 3px 0;
    margin-top: 1px;
    margin-bottom: 1px;
  }

  &.ProseMirror-focused {
    outline: none;
  }

  ul,
  ol {
    padding: 3px 24px;

    li {
      padding: 3px 2px;
    }
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

  .ProseMirror-yjs-cursor.ProseMirror-widget {
    position: relative;
    display: inline-block;
    margin-left: -1px;
    height: 100%;
    box-sizing: border-box;
    z-index: 10;

    .yjs-cursor-edge {
      position: absolute;
      top: 0px;
      left: 0;
      font-size: 0;
      height: 5px;
      width: 3px;
      border-radius: 0 2px 2px 0;
      transition: all 0.2s ease;
    }

    > div {
      position: absolute;
      top: -17px;
      left: -2px;
      border-radius: 4px 4px 4px 0;
      padding: 0 6px;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.8;
      opacity: 0;
      transition: all 0.2s ease;
    }

    &:hover {
      .yjs-cursor-edge {
        opacity: 0;
      }

      > div {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  .ProseMirror[dir='rtl'] {
    .ProseMirror-yjs-cursor.ProseMirror-widget {
      > div {
        left: auto;
        right: 100%;
        margin-left: 0;
        margin-right: 6px;
        direction: rtl;
      }
    }
  }
}
</style>
