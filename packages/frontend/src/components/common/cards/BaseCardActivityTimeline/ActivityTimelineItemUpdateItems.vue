<script setup lang="ts">
import type { Field, User } from '@tillywork/shared';

import ActivityTimelineItemUpdateFieldItem from './ActivityTimelineItemUpdateFieldItem.vue';

const { items } = defineProps<{
  items: string[];
  field: Field;
  users: User[];
}>();
</script>

<template>
  <div class="d-inline-flex flex-wrap align-center ga-2 px-1">
    <template v-for="item in items" :key="item">
      <activity-timeline-item-update-field-item
        v-if="field && users"
        :field
        :users
        :item
      />
    </template>
  </div>
</template>
