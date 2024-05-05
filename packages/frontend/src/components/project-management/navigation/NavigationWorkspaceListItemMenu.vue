<script setup lang="ts">
import { watch } from 'vue';
import { ref } from 'vue';

const listMenu = ref(false);

const emit = defineEmits(['hover:freeze', 'hover:unfreeze']);

function handleListMenuClick() {
  listMenu.value = !listMenu.value;
  emit('hover:freeze');
}

watch(listMenu, () => {
  if (!listMenu.value) {
    emit('hover:unfreeze');
  }
});
</script>

<template>
  <v-btn
    id="list-menu-btn"
    color="default"
    density="compact"
    icon="mdi-dots-vertical"
    rounded="md"
    size="small"
    @click.stop
    @click="handleListMenuClick"
  />

  <v-menu
    v-model="listMenu"
    :close-on-content-click="false"
    target="#list-menu-btn"
  >
    <v-card color="menu" class="pt-3 mt-2" width="300px" density="compact">
      <div class="px-5 text-truncate mb-2">
        <v-icon size="small">mdi-sitemap</v-icon>
        <span class="ml-1"> Your workspaces </span>
      </div>
    </v-card>
  </v-menu>
</template>
