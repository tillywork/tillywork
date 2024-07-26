<script setup lang="ts">
import { type BaseContextMenuProps } from '@/components/common/base/BaseContextMenu/BaseContextMenuWrapper.vue';

const props = defineProps<{
  data: any;
  items: BaseContextMenuProps[];
}>();

const emit = defineEmits(['context-menu:close']);

function handleAction(callback?: (data: unknown) => void) {
  emit('context-menu:close');

  if (callback) callback(props.data);
}
</script>

<template>
  <v-list min-width="200">
    <template v-for="item in items" :key="item.value">
      <template v-if="item.children">
        <v-menu location="end" open-on-hover>
          <template #activator="{ props }">
            <v-list-item
              v-bind="{
                ...props,
                ...item.props,
              }"
              append-icon="mdi-chevron-right"
              @click="() => handleAction(item.onClick)"
            />
          </template>
          <v-sheet border="sm">
            <base-context-menu-list :data :items="item.children" />
          </v-sheet>
        </v-menu>
      </template>

      <v-list-item
        v-else
        v-bind="item.props"
        @click="() => handleAction(item.onClick)"
      />
    </template>
  </v-list>
</template>
