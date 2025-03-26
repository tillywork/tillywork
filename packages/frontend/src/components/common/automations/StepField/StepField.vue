<script setup lang="ts">
import { useEditor, EditorContent, type JSONContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

import _ from 'lodash';

import { FieldTypes, type AutomationFieldOption } from '@tillywork/shared';

import { PlaceholderNode } from './PlaceholderNode';

import { OnClickOutside } from '@vueuse/components';
import PlaceholderList from './PlaceholderList.vue';
import BaseCurrencyInput from '../../inputs/BaseCurrencyInput.vue';
import BasePercentageInput from '../../inputs/BasePercentageInput.vue';
import BaseNumberInput from '../../inputs/BaseNumberInput.vue';

const {
  title,
  type,
  required = false,
  options,
  allowDynamicValues = false,
  multiple = false,
  disabled = false,
} = defineProps<{
  title: string;
  type: FieldTypes;
  required?: boolean;
  options?: AutomationFieldOption[];
  allowDynamicValues?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}>();

const modelValue = defineModel<any>({
  default: null,
});

function checkForPlaceholders(value: any): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    return value.includes('{{') && value.includes('}}');
  }

  if (Array.isArray(value)) {
    return value.some(
      (item) =>
        typeof item === 'string' && item.includes('{{') && item.includes('}}')
    );
  }

  if (typeof value === 'object') {
    return (
      JSON.stringify(value).includes('{{') &&
      JSON.stringify(value).includes('}}')
    );
  }

  return false;
}

const hasPlaceholders = computed(() => checkForPlaceholders(modelValue.value));

const editorValue = ref<JSONContent>(valueToNode(modelValue.value));

const placeholders = inject('placeholders', ref({}));

const isFocused = ref(false);
const isPlaceholderMenuOpen = ref(false);
const isOptionsMenuOpen = ref(false);

const isPlaceholderModeActive = ref(false);

const editor = useEditor({
  content: editorValue.value,
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      blockquote: false,
    }),
    PlaceholderNode,
  ],
  editable: !disabled,
  onUpdate({ editor }) {
    const newContent = editor.getJSON();

    if (!newContent) {
      return;
    }

    if (!_.isEqual(editorValue.value, newContent)) {
      editorValue.value = newContent;
      syncModelValueFromEditorValue(newContent);
    }
  },
  onFocus() {
    handleFocus();
  },
});

watch(modelValue, (newValue) => {
  if (showPlaceholderEditor.value) {
    const currentContent = editor.value?.getJSON() ?? [];
    if (!_.isEqual(nodeValueToRaw(currentContent), newValue)) {
      syncEditorValueFromModelValue(newValue);
    }
  }
});

function syncModelValueFromEditorValue(newContent: JSONContent) {
  const rawValue = nodeValueToRaw(newContent);

  if (rawValue === '' || rawValue === null) {
    modelValue.value = multiple ? [] : null;
  } else if (!_.isEqual(modelValue.value, rawValue)) {
    modelValue.value = rawValue;
  }
}

function syncEditorValueFromModelValue(newValue: any) {
  const newContent = valueToNode(newValue);
  if (!_.isEqual(editorValue.value, newContent)) {
    editor.value?.commands.setContent(newContent, false);
  }
}

const editorClass = computed(() => {
  const propClasses = {
    'is-disabled': disabled,
    'is-focused': isFocused.value,
  };

  const styleClasses = ['rounded-md', 'border-thin'];

  return [
    ...styleClasses,
    ...Object.entries(propClasses)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value)
      .map(([key]) => key),
  ];
});

function valueToNode(value: any): JSONContent {
  if (value === null || value === undefined) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '',
            },
          ],
        },
      ],
    };
  }

  let text = '';
  if (typeof value === 'string') {
    text = value;
  } else if (Array.isArray(value)) {
    text = value.join(',');
  } else if (typeof value === 'object') {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  let match;
  const nodes: JSONContent[] = [];
  let lastIndex = 0;

  while ((match = placeholderRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text.substring(lastIndex, match.index),
          },
        ],
      });
    }

    nodes.push({
      type: 'placeholder',
      attrs: {
        placeholderPath: match[0],
      },
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: text.substring(lastIndex),
        },
      ],
    });
  }

  if (nodes.length === 0) {
    nodes.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: text ?? '',
        },
      ],
    });
  }

  return {
    type: 'doc',
    content: nodes,
  };
}

function nodeValueToRaw(node: JSONContent): any {
  if (!node) return null;

  if (node.type === 'dropdown') {
    return node.attrs?.value || null;
  }

  let value = '';

  switch (node.type) {
    case 'placeholder':
      value += node.attrs?.placeholderPath || '';
      break;
    case 'doc':
    case 'paragraph':
      node.content?.forEach((inlineNode) => {
        value += nodeValueToString(inlineNode);
      });
      break;
    case 'text':
      value += node.text ?? '';
      break;
  }

  return value;
}

function nodeValueToString(node: JSONContent): string {
  let value = '';

  switch (node.type) {
    case 'placeholder':
      value += node.attrs?.placeholderPath || '';
      break;
    case 'dropdown': {
      const dropdownValue = node.attrs?.value;
      if (Array.isArray(dropdownValue)) {
        value += dropdownValue.join(',');
      } else {
        value += dropdownValue || '';
      }
      break;
    }
    case 'doc':
    case 'paragraph':
      node.content?.forEach((inlineNode) => {
        value += nodeValueToString(inlineNode);
      });
      break;
    case 'text':
      value += node.text ?? '';
      break;
    default:
      console.error(
        '[StepField#nodeValueToString] Unknown node type: ',
        node.type
      );
  }

  return value;
}

function showPlaceholderMenu() {
  isPlaceholderMenuOpen.value = true;
}

function hidePlaceholderMenu() {
  if (isFocused.value) {
    return;
  }

  isPlaceholderMenuOpen.value = false;
}

function handleFocus() {
  isFocused.value = true;

  if (allowDynamicValues || isPlaceholderModeActive.value) {
    showPlaceholderMenu();
  }

  if (options) {
    showOptionsMenu();
  }
}

function handleBlur() {
  isFocused.value = false;
  hidePlaceholderMenu();

  if (options) {
    hideOptionsMenu();
  }
}

function handleInsertPlaceholder(item: string) {
  editor.value?.commands.setPlaceholder({
    placeholderPath: `{{${item}}}`,
  });
}

function showOptionsMenu() {
  isOptionsMenuOpen.value = true;
}

function hideOptionsMenu() {
  isOptionsMenuOpen.value = false;
}

const showPlaceholderEditor = computed(() => {
  if (
    modelValue.value !== null &&
    modelValue.value !== undefined &&
    modelValue.value !== '' &&
    !hasPlaceholders.value &&
    options
  ) {
    return false;
  }

  return isPlaceholderModeActive.value || hasPlaceholders.value;
});

const fieldInputComponent = computed(() => {
  if (showPlaceholderEditor.value) {
    return null;
  }

  return getFieldInputComponent();
});

function getFieldInputComponent() {
  if (showPlaceholderEditor.value) {
    return null;
  }

  switch (type) {
    case FieldTypes.TEXT:
    case FieldTypes.EMAIL:
    case FieldTypes.URL:
      return 'v-text-field';
    case FieldTypes.LABEL:
    case FieldTypes.DROPDOWN:
    case FieldTypes.USER:
      return 'v-autocomplete';
    case FieldTypes.DATE:
    case FieldTypes.DATETIME:
      return 'base-date-picker';
    case FieldTypes.CHECKBOX:
      return 'v-checkbox';
    case FieldTypes.NUMBER:
      return BaseNumberInput;
    case FieldTypes.CURRENCY:
      return BaseCurrencyInput;
    case FieldTypes.PERCENTAGE:
      return BasePercentageInput;
    default:
      return null;
  }
}

const fieldProps = computed(() => {
  const props: Record<string, any> = {
    modelValue: modelValue.value,
    disabled,
    hideDetails: true,
    rounded: 'md',
    textField: true,
  };

  if (options) {
    props.items = options;
    props.itemTitle = 'title';
    props.itemValue = 'value';
    props.multiple = multiple;
    props.chips = multiple;

    if (
      !modelValue.value ||
      (Array.isArray(modelValue.value) && modelValue.value.length === 0)
    ) {
      props.placeholder = `Select ${title.toLowerCase()}`;
      props.persistentPlaceholder = true;
    }
  }

  if (type === FieldTypes.DATE || type === FieldTypes.DATETIME) {
    props.includeTime = type === FieldTypes.DATETIME;
  }

  return props;
});

function handleInputChange(value: any) {
  modelValue.value = value;
}
</script>

<template>
  <on-click-outside @trigger="handleBlur">
    <div class="dynamic-field-wrapper">
      <div class="d-flex align-center">
        <editor-content
          v-if="!fieldInputComponent || showPlaceholderEditor"
          :editor="editor"
          class="editor-content"
          :class="editorClass"
        />

        <component
          v-else
          :is="fieldInputComponent"
          v-bind="fieldProps"
          class="w-100"
          @update:model-value="handleInputChange"
          @focus="handleFocus"
        />
      </div>

      <v-menu
        v-if="allowDynamicValues"
        v-model="isPlaceholderMenuOpen"
        target="parent"
        attach="parent"
        location="start"
        :close-on-content-click="false"
        offset="170"
      >
        <placeholder-list
          :sample-data="placeholders"
          @select="handleInsertPlaceholder"
        />
      </v-menu>
    </div>
  </on-click-outside>
</template>

<style lang="scss" scoped>
$borderOpacity: 0.9;
$borderOpacityInactive: 0.4;

.dynamic-field-wrapper {
  position: relative;
  width: 100%;
}

.editor-content {
  min-height: 30px;
  width: 100%;
  flex-grow: 1;
  padding-inline-start: 8px;
  padding-inline-end: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
  transition: all 0.08s ease-out;
  border-color: rgba(
    var(--v-theme-on-surface),
    $borderOpacityInactive
  ) !important;

  &:hover {
    border-color: rgba(var(--v-theme-on-surface), $borderOpacity) !important;
  }

  &.is-focused {
    border-color: rgba(var(--v-theme-primary), $borderOpacity) !important;
  }

  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  :deep(.ProseMirror) {
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.825rem;

    &.ProseMirror-focused {
      outline: none;
    }

    p {
      margin: 0;
    }
  }
}
</style>
