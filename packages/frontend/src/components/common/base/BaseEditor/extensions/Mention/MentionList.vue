<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import BaseAvatar from '../../../BaseAvatar.vue';

const props = defineProps<{
  items: User[];
  command: any;
}>();
const emit = defineEmits(['selectItem']);

const selected = ref(0);

const selectItem = (index: number) => {
  const item = props.items[index];
  if (item) {
    props.command({ id: item.id });
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

defineExpose({
  onKeyDown,
});
</script>

<template>
  <v-card border="thin">
    <v-list>
      <template v-for="(item, index) in props.items" :key="index">
        <v-list-item
          class="item"
          :active="index === selected"
          @click="selectItem(index)"
        >
          <template #prepend>
            <base-avatar
              :text="item.firstName + ' ' + item.lastName"
              :photo="item.photo"
              class="me-2"
            />
          </template>
          <v-list-item-title>
            {{ item.firstName + ' ' + item.lastName }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
