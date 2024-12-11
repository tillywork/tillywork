<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../types';
import { CardTypeLayout, type CardType } from '@tillywork/shared';
import { useStateStore } from '@/stores/state';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from './DefaultLayout.vue';
import PersonLayout from './PersonLayout.vue';
import OrganizationLayout from './OrganizationLayout.vue';

const dialog = useDialogStore();
const { currentList } = storeToRefs(useStateStore());
const { workspace } = storeToRefs(useAuthStore());

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_CARD)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

const list = computed(() => {
  if (currentDialog.value?.data?.list) {
    return currentDialog.value.data.list;
  } else {
    return currentList.value;
  }
});

const cardType = computed<CardType>(() => {
  if (currentDialog.value?.data && currentDialog.value.data?.type) {
    return currentDialog.value.data.type;
  } else if (list.value) {
    return list.value?.defaultCardType;
  } else {
    return workspace.value?.defaultCardType;
  }
});
</script>

<template>
  <template v-if="cardType.layout === CardTypeLayout.DEFAULT">
    <default-layout />
  </template>
  <template v-else-if="cardType.layout === CardTypeLayout.PERSON">
    <person-layout />
  </template>
  <template v-else-if="cardType.layout === CardTypeLayout.ORGANIZATION">
    <organization-layout />
  </template>
</template>
