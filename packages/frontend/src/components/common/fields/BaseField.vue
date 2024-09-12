<script setup lang="ts">
import { useProjectUsersService } from '@/services/useProjectUsersService';
import BaseLabelSelector from '../inputs/BaseLabelSelector.vue';
import BaseRelationInput from '../inputs/BaseRelationInput.vue';
import BaseDropdownInput from '../inputs/BaseDropdownInput.vue';
import { useAuthStore } from '@/stores/auth';
import { type Field, FieldTypes } from '@tillywork/shared';

const value = defineModel<any>();

defineProps<{
  field: Field;
  noLabel?: boolean;
  flexFill?: boolean;
  rounded?: string;
}>();

const { project, user } = storeToRefs(useAuthStore());
const { useProjectUsersQuery } = useProjectUsersService();

const { data: users } = useProjectUsersQuery({
  projectId: project.value!.id,
  select: (projectUsers) =>
    projectUsers
      .map((projectUser) => projectUser.user)
      .sort((a) => (a.id === user.value!.id ? 0 : 1)),
});
</script>

<template>
  <template v-if="field.type === FieldTypes.DATE">
    <base-date-picker
      v-model="value"
      :icon="field.icon ?? 'mdi-calendar'"
      :label="field.name"
      :rounded
    />
  </template>
  <template v-else-if="field.type === FieldTypes.TEXT">
    <v-text-field
      v-model="value"
      hide-details
      :placeholder="field.name"
      :prepend-inner-icon="field.icon"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.DROPDOWN">
    <base-dropdown-input
      v-model="value"
      :items="field.items"
      :icon="field.icon"
      :placeholder="field.name"
      :multiple="field.multiple"
      :rounded
    />
  </template>
  <template v-else-if="field.type === FieldTypes.LABEL">
    <base-label-selector
      v-model="value"
      :items="field.items"
      :icon="field.icon"
      :placeholder="field.name"
      :multiple="field.multiple"
      density="compact"
      :rounded
    />
  </template>
  <template v-else-if="field.type === FieldTypes.USER">
    <base-user-selector
      v-model="value"
      :users="users ?? []"
      :label="!noLabel ? field.name : undefined"
      return-id
      return-string
      :icon="field.icon"
      size="24"
      :fill="flexFill"
      :rounded
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CARD">
    <base-relation-input v-model="value" :field variant="outlined" />
  </template>
</template>
