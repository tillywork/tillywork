<script setup lang="ts">
import type { Card } from '@tillywork/shared';

import MenuWrapper from '@/components/common/base/ContextMenu/MenuWrapper.vue';
import { useCardContextMenu } from '@/composables/useCardContextMenu';

const { card } = defineProps<{
  card: Card;
}>();

const menu = defineModel({
  default: false,
});

defineSlots<{
  activator(props: { props: Record<string, unknown> }): void;
}>();

const { items } = useCardContextMenu(card, closeMenu);

function closeMenu() {
  menu.value = false;
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" width="180">
    <template #activator="{ props }">
      <slot name="activator" :props>
        <!-- Default activator if none is provided -->
        <v-btn
          v-bind="props"
          class="text-caption me-2"
          density="comfortable"
          color="primary"
          variant="tonal"
        >
          <template #append>
            <v-icon icon="mdi-dots-vertical" />
          </template>
          Actions
        </v-btn>
      </slot>
    </template>
    <menu-wrapper :items />
  </v-menu>
</template>
