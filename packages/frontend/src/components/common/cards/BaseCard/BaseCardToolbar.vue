<script setup lang="ts">
import {
  type Card,
  ListType,
  type List,
  type ListStage,
  WorkspaceTypes,
} from '@tillywork/shared';

import BaseCardStageBar from '../BaseCardStageBar.vue';
import BaseCardActions from './BaseCardActions.vue';

import { useAuthStore } from '@/stores/auth';

const card = defineModel<Card>({
  required: true,
});

const emit = defineEmits(['close']);

const {
  list,
  listStages,
  hideBackButton = false,
  closable = false,
} = defineProps<{
  list?: List;
  listStages?: ListStage[];
  hideBackButton?: boolean;
  closable?: boolean;
}>();

const { workspace } = storeToRefs(useAuthStore());

function getListRoute() {
  switch (workspace.value?.type) {
    case WorkspaceTypes.CRM:
      return `/crm/${list?.slug}`;

    case WorkspaceTypes.PROJECT_MANAGEMENT:
    default:
      return `/pm/list/${list?.id}`;
  }
}

function handleClickClose() {
  emit('close');
}
</script>

<template>
  <v-toolbar color="surface" class="px-2 border-b-thin" density="compact">
    <v-btn
      v-if="!hideBackButton && list"
      class="text-caption me-4"
      density="comfortable"
      color="primary"
      :to="getListRoute()"
    >
      <template #prepend>
        <v-icon start icon="mdi-chevron-left" />
      </template>
      <v-icon :icon="list.icon" :color="list.iconColor" start />
      {{ list.name }}
    </v-btn>
    <base-card-actions :card />
    <div v-if="list?.type === ListType.DEALS && listStages" class="px-6">
      <base-card-stage-bar v-model="card.cardLists[0].listStage" :listStages />
    </div>
    <v-spacer />
    <v-btn v-if="closable" icon density="comfortable" @click="handleClickClose">
      <v-icon icon="mdi-close" />
    </v-btn>
  </v-toolbar>
</template>
