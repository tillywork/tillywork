<script setup lang="ts">
const props = defineProps<{
  data: any;
  items: readonly any[];
}>();

const emit = defineEmits(['context-menu:close']);

function getItemById(items: readonly any[], ids: unknown[]) {
  const id = ids.shift();
  const item = items.find((item) => item.props.value === id);

  if (ids.length) return getItemById(item.children, ids);
  return item;
}

function handleAction({ path: ids }: { path: unknown[] }) {
  hideContextMenu();

  const item = getItemById(props.items, ids);
  item.onClick(props.data);
}

function hideContextMenu() {
  emit('context-menu:close');
}
</script>

<template>
  <v-list width="200" @click:select="handleAction" :selected="[]">
    <template v-for="item in items" :key="item.value">
      <template v-if="item.children">
        <v-menu location="end" open-on-hover>
          <template #activator="{ props }">
            <v-list-item
              :title="item.title"
              v-bind="{
                ...props,
                ...item.props,
              }"
              append-icon="mdi-chevron-right"
            />
          </template>
          <v-sheet border="sm">
            <base-context-menu-list :data :items="item.children" />
          </v-sheet>
        </v-menu>
      </template>

      <v-list-item v-else v-bind="item.props" />
    </template>
  </v-list>
</template>
