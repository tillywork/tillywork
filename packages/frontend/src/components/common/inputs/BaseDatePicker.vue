<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';

const dateValue = defineModel<string | Date>();
const props = defineProps<{
  noDateMessage?: string;
  closeOnContentClick?: boolean;
}>();
const dateDialog = ref(false);
</script>

<template>
  <v-menu
    v-model="dateDialog"
    :close-on-content-click="closeOnContentClick ?? false"
  >
    <template #activator="{ props }">
      <base-card-property-value-btn v-bind="props" class="text-caption">
        <template v-if="dateValue">
          {{ dayjs(dateValue).format('MMM D') ?? 'Empty' }}
        </template>
        <template v-else>
          {{ noDateMessage ?? 'No Date Selected' }}
        </template>
      </base-card-property-value-btn>
    </template>
    <v-date-picker v-model="dateValue" show-adjacent-months color="primary" />
  </v-menu>
</template>
