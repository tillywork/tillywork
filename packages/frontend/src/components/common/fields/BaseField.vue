<script setup lang="ts">
import BaseLabelSelector from '../inputs/BaseLabelSelector.vue';
import BaseRelationInput from '../inputs/BaseRelationInput.vue';
import BaseDropdownInput from '../inputs/BaseDropdownInput.vue';
import BaseNumberInput from '../inputs/BaseNumberInput.vue';
import BaseCurrencyInput from '../inputs/BaseCurrencyInput.vue';

import { useProjectUsersService } from '@/services/useProjectUsersService';

import { useAuthStore } from '@/stores/auth';

import { type Field, FieldTypes } from '@tillywork/shared';

import validationUtils from '@/utils/validation';

const value = defineModel<any>();

defineProps<{
  field: Field;
  noLabel?: boolean;
  flexFill?: boolean;
  rounded?: string;
  table?: boolean;
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
  <template v-else-if="field.type === FieldTypes.DATETIME">
    <base-date-picker
      v-model="value"
      :icon="field.icon ?? 'mdi-calendar'"
      :label="field.name"
      :rounded
      include-time
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
      :fill="flexFill"
      :label="field.name"
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
      :fill="flexFill"
      :label="field.name"
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
      :multiple="field.multiple"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CARD">
    <base-relation-input v-model="value" :field variant="outlined" />
  </template>
  <template v-else-if="field.type === FieldTypes.CHECKBOX">
    <div
      class="base-checkbox d-flex align-center user-select-none"
      :class="table ? 'justify-center' : ''"
      @click.prevent="value = !value"
    >
      <v-checkbox v-model="value" hide-details />
      <v-label
        v-if="!table"
        class="flex-fill fill-height text-caption cursor-pointer"
        >{{ field.name }}</v-label
      >
    </div>
  </template>
  <template v-else-if="field.type === FieldTypes.NUMBER">
    <base-number-input
      v-model="value"
      @click.prevent
      :rounded
      :fill="flexFill"
      :tooltip="field.name"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.EMAIL">
    <v-text-field
      v-model="value"
      hide-details
      :placeholder="field.name"
      :prepend-inner-icon="field.icon"
      :rules="[validationUtils.rules.email]"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CURRENCY">
    <base-currency-input
      v-model="value"
      @click.prevent
      :rounded
      :fill="flexFill"
      :tooltip="field.name"
    />
  </template>
</template>

<style lang="scss">
.base-checkbox {
  .v-checkbox {
    .v-selection-control {
      min-height: auto !important;
    }
  }
}
</style>
