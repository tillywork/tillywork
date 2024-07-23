<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { VList, VVirtualScroll } from 'vuetify/components';

const props = defineProps<{
  items: { name: string; emoji: string }[];
  editor: Editor;
  query: string;
}>();

const selected = ref(0);
const emojiScroller = ref<VVirtualScroll>();

const selectItem = (index: number) => {
  const item = props.items[index];
  if (item) {
    const { editor } = props;
    const { state, dispatch } = editor.view;
    const { tr } = state;

    const { from, to } = state.selection;

    const emojiNodeType = editor.schema.nodes.emoji;

    const emojiNode = emojiNodeType.create({ name: item.emoji });

    tr.replaceWith(from - (1 + props.query.length), to, emojiNode);

    dispatch(tr);
  }
};

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === 'ArrowUp') {
    upHandler();
    return true;
  }

  if (event.key === 'ArrowDown') {
    downHandler();
    return true;
  }

  if (event.key === 'Enter') {
    selectItem(selected.value);
    return true;
  }

  return false;
};

const upHandler = () => {
  selected.value =
    (selected.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selected.value = (selected.value + 1) % props.items.length;
};

const ensureVisible = () => {
  if (emojiScroller.value) {
    emojiScroller.value.scrollToIndex(selected.value);
  }
};

defineExpose({
  onKeyDown,
});

watch(
  () => props.items,
  () => (selected.value = 0)
);
watch(selected, () => {
  ensureVisible();
});
</script>

<template>
  <v-card border="thin" width="230" class="overflow-scroll">
    <v-list :lines="false">
      <v-virtual-scroll
        :items
        ref="emojiScroller"
        :item-height="32"
        :max-height="305"
      >
        <template v-slot:default="{ item, index }">
          <v-list-item
            class="user-select-none"
            :active="index === selected"
            @click="selectItem(index)"
          >
            <template #prepend>
              <span class="me-2">{{ item.emoji }}</span>
            </template>
            <v-list-item-title> :{{ item.name }}: </v-list-item-title>
          </v-list-item>
        </template>
      </v-virtual-scroll>

      <template v-if="!props.items.length">
        <v-list-item>
          <template #prepend>
            <span class="me-2">😢</span>
          </template>
          <v-list-item-title>No results found.</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
