<script setup lang="ts">
import MenuWrapper from '@/components/common/base/ContextMenu/MenuWrapper.vue';
import type { ContextMenuItem } from '@/components/common/base/ContextMenu/types';

const attrs = useAttrs();

const selected = defineModel<boolean | null>({
  default: false,
});

const options: ContextMenuItem[] = [
  {
    title: 'Not completed',
    color: 'primary',
    value: false,
  },
  {
    title: 'Completed',
    color: 'success',
    value: true,
  },
];

const chipLabel = computed(() => {
  if (selected.value === null) {
    return 'Status';
  }

  if (selected.value) {
    return 'Status is completed';
  }

  return 'Status is not completed';
});

function clearValue() {
  selected.value = null;
}
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-chip
        v-bind="{
          ...props,
          ...attrs,
        }"
        class="text-caption text-medium-emphasis bg-accent-lighten"
        density="compact"
        border="thin"
        :style="{
          width: 'fit-content',
        }"
      >
        <template #prepend>
          <v-icon icon="mdi-circle-slice-8" start />
        </template>
        {{ chipLabel }}

        <template #close v-if="selected !== null">
          <v-btn
            icon
            density="compact"
            size="small"
            color="transparent"
            variant="flat"
            @click.stop="clearValue"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </template>
      </v-chip>
    </template>
    <template #default="{ isActive }">
      <menu-wrapper
        v-model="selected"
        selectable
        :items="options"
        :open="isActive.value"
      />
    </template>
  </v-menu>
</template>
