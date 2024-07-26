<script setup lang="ts">
const props = defineProps<{
  data: any;
  items: readonly any[];
}>();

const emit = defineEmits(['context-menu:close']);

function handleAction(callback: (data: unknown) => void) {
  emit('context-menu:close');

  callback(props.data);
}
</script>

<template>
  <v-list min-width="200">
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
