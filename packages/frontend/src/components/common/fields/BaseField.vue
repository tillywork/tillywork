<script setup lang="ts">
import BaseLabelSelector from '../inputs/BaseLabelSelector.vue';
import BaseRelationInput from '../inputs/BaseRelationInput.vue';
import BaseDropdownInput from '../inputs/BaseDropdownInput.vue';
import BaseNumberInput from '../inputs/BaseNumberInput.vue';
import BaseCurrencyInput from '../inputs/BaseCurrencyInput.vue';
import BasePercentageInput from '../inputs/BasePercentageInput.vue';

import { useProjectUsersService } from '@/services/useProjectUsersService';

import { useAuthStore } from '@/stores/auth';

import { type Field, FieldTypes } from '@tillywork/shared';

import validationUtils from '@/utils/validation';

const value = defineModel<any>();

const {
  rounded = 'pill',
  hideIcon = false,
  hideLabel = false,
} = defineProps<{
  field: Field;
  hideLabel?: boolean;
  flexFill?: boolean;
  rounded?: string;
  table?: boolean;
  hideIcon?: boolean;
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

function getFieldIcon(field: Field) {
  if (!hideIcon) {
    return field.icon;
  }
}

function getFieldLabel(field: Field) {
  if (!hideLabel) {
    return field.name;
  }
}
</script>

<template>
  <template v-if="[FieldTypes.DATE, FieldTypes.DATETIME].includes(field.type)">
    <base-date-picker
      v-model="value"
      :icon="getFieldIcon(field)"
      :label="getFieldLabel(field)"
      :rounded
      :fill="flexFill"
      :include-time="field.type === FieldTypes.DATETIME"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.TEXT">
    <v-text-field
      v-model="value"
      hide-details
      :rounded
      :placeholder="field.name"
      :prepend-inner-icon="getFieldIcon(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.DROPDOWN">
    <base-dropdown-input
      v-model="value"
      :items="field.items"
      :icon="getFieldIcon(field)"
      :placeholder="field.name"
      :multiple="field.multiple"
      :rounded
      :fill="flexFill"
      :label="getFieldLabel(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.LABEL">
    <base-label-selector
      v-model="value"
      :items="field.items"
      :icon="getFieldIcon(field)"
      :placeholder="field.name"
      :multiple="field.multiple"
      density="compact"
      :rounded
      :fill="flexFill"
      :label="getFieldLabel(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.USER">
    <base-user-selector
      v-model="value"
      :users="users ?? []"
      :label="getFieldLabel(field)"
      :tooltip="field.name"
      return-id
      return-string
      :icon="getFieldIcon(field)"
      size="24"
      :fill="flexFill"
      :rounded
      :multiple="field.multiple"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CARD">
    <base-relation-input
      v-model="value"
      :field
      variant="outlined"
      :fill="flexFill"
      :rounded
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CHECKBOX">
    <div
      class="base-checkbox d-flex align-center user-select-none"
      :class="table ? 'justify-center' : ''"
      @click.prevent="value = !value"
    >
      <v-checkbox v-model="value" hide-details />
      <v-label
        v-if="!hideLabel"
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
      :label="getFieldLabel(field)"
      :icon="getFieldIcon(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.PERCENTAGE">
    <base-percentage-input
      v-model="value"
      @click.prevent
      :rounded
      :fill="flexFill"
      :label="getFieldLabel(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.CURRENCY">
    <base-currency-input
      v-model="value"
      @click.prevent
      :rounded
      :fill="flexFill"
      :label="getFieldLabel(field)"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.EMAIL">
    <v-text-field
      v-model="value"
      hide-details
      :rounded
      :placeholder="field.name"
      :prepend-inner-icon="getFieldIcon(field)"
      :rules="[validationUtils.rules.email]"
    />
  </template>
  <template v-else-if="field.type === FieldTypes.URL">
    <v-text-field
      v-model="value"
      hide-details
      :rounded
      :placeholder="field.name"
      :prepend-inner-icon="getFieldIcon(field)"
      :rules="[validationUtils.rules.url]"
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
