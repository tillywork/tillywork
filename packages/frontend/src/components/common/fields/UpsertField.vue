<script setup lang="ts">
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryStore } from '@/stores/query';
import { useDialogStore } from '@/stores/dialog';

import { useFieldsService } from '@/services/useFieldsService';

import { DIALOGS, UpsertDialogMode } from '../dialogs/types';
import {
  FIELD_TYPE_OPTIONS,
  FieldTypes,
  type CreateFieldDto,
  type Field,
} from '@tillywork/shared';
import type { VForm } from 'vuetify/components';

import validationUtils from '@/utils/validation';

import BaseArrayInput from '../inputs/BaseArrayInput.vue';
import BaseIconSelector from '../inputs/BaseIconSelector/BaseIconSelector.vue';

interface FieldFlag {
  key: 'isTitle' | 'isAssignee' | 'isDescription';
  label: string;
  hint: string;
}

const emit = defineEmits(['close']);

const fieldDto = defineModel<Partial<Field> | CreateFieldDto>({
  required: true,
});

const { upsertMode } = defineProps<{
  upsertMode: UpsertDialogMode;
}>();
const upsertFieldForm = ref<VForm>();
const slugExistsErrorMessage = ref('');

const isUpdateOrCreateLoading = computed(
  () => isUpdateLoading.value || isCreateLoading.value
);

const showIsMultiple = computed(() =>
  [
    FieldTypes.DROPDOWN,
    FieldTypes.LABEL,
    FieldTypes.USER,
    FieldTypes.CARD,
  ].includes(fieldDto.value?.type as FieldTypes)
);

const showListsField = computed(() => !fieldDto.value.cardType);

const pinnableField = computed(() =>
  [
    FieldTypes.DROPDOWN,
    FieldTypes.LABEL,
    FieldTypes.USER,
    FieldTypes.DATE,
    FieldTypes.DATETIME,
    FieldTypes.CHECKBOX,
    FieldTypes.NUMBER,
  ].includes(fieldDto.value?.type as FieldTypes)
);

const fieldFlags = computed<FieldFlag[]>(() => {
  if (!fieldDto.value.cardType) return [];

  switch (fieldDto.value.type) {
    case FieldTypes.TEXT:
      return [
        {
          key: 'isTitle',
          label: `Use as ${fieldDto.value.cardType.name.toLowerCase()} title`,
          hint: `This field will be used as the main title for ${fieldDto.value.cardType.name} cards`,
        },
      ];
    case FieldTypes.USER:
      return [
        {
          key: 'isAssignee',
          label: 'Use as assignee field',
          hint: `Users selected in this field will be considered ${fieldDto.value.cardType.name} assignees`,
        },
      ];
    case FieldTypes.RICH:
      return [
        {
          key: 'isDescription',
          label: 'Use as description',
          hint: `This field will be used as the description for the ${fieldDto.value.cardType.name}`,
        },
      ];
    default:
      return [];
  }
});

const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();
const { cardTypes, lists } = storeToRefs(useQueryStore());

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

const { updateFieldMutation, createFieldMutation, deleteFieldMutation } =
  useFieldsService();
const { mutateAsync: updateField, isPending: isUpdateLoading } =
  updateFieldMutation();
const { mutateAsync: createField, isPending: isCreateLoading } =
  createFieldMutation();
const { mutateAsync: deleteField } = deleteFieldMutation();

async function saveField() {
  if (!fieldDto.value) {
    return;
  }

  const isValid = await upsertFieldForm.value?.validate();
  if (!isValid?.valid) {
    return;
  }

  switch (upsertMode) {
    case UpsertDialogMode.UPDATE:
      updateField(fieldDto.value as Partial<Field>)
        .then(() => {
          emit('close');
        })
        .catch(() =>
          showSnackbar({
            message: 'Something went wrong, please try again.',
            color: 'error',
          })
        );
      break;

    case UpsertDialogMode.CREATE:
      createField(fieldDto.value as CreateFieldDto)
        .then(() => {
          emit('close');
        })
        .catch((e) => {
          if (e.response?.status === 409) {
            slugExistsErrorMessage.value = e.response?.data?.message;
          } else {
            showSnackbar({
              message:
                e.response?.data?.message ??
                'Something went wrong, please try again.',
              color: 'error',
            });
          }
        });
      break;
  }
}

function handleDeleteField() {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: `Delete ${fieldDto.value?.name} field?`,
      message:
        'Are you sure you want to do this? Deleting this field will remove it from all cards and lists and may cause you to lose your data. This action cannot be undone.',
      onConfirm: () =>
        deleteField((fieldDto.value as Field).id)
          .then(() => {
            dialog.closeDialog(confirmDialogIndex.value);
            emit('close');
          })
          .catch(() =>
            showSnackbar({
              message: 'Something went wrong, please try again.',
              color: 'error',
            })
          ),
    },
  });
}
</script>

<template>
  <v-form ref="upsertFieldForm" @submit.prevent="saveField">
    <div class="user-select-none">
      <h3 class="d-flex align-start flex-column ga-2">
        <v-btn
          class="text-capitalize mb-2"
          prepend-icon="mdi-chevron-left"
          text="Back"
          variant="text"
          density="comfortable"
          @click="emit('close')"
        />
        <span>
          <span class="text-capitalize">{{ upsertMode }}</span>
          field
        </span>
      </h3>
      <p class="mb-4 text-subtitle-2">General</p>
    </div>

    <!-- Field Name -->
    <v-text-field
      v-model="fieldDto.name"
      label="Field name*"
      :rules="[validationUtils.rules.required]"
    >
      <template #prepend-inner>
        <base-icon-selector v-model="fieldDto.icon" />
      </template>
    </v-text-field>

    <v-text-field
      v-model="fieldDto.slug"
      label="Field slug*"
      :rules="[validationUtils.rules.required]"
      :error-messages="slugExistsErrorMessage"
      :readonly="upsertMode !== UpsertDialogMode.CREATE"
      :hint="
        upsertMode === UpsertDialogMode.UPDATE
          ? 'Field slug cannot be changed.'
          : ''
      "
    />

    <!-- Field Type -->
    <v-autocomplete
      v-model="fieldDto.type"
      :items="FIELD_TYPE_OPTIONS"
      label="Field type*"
      auto-select-first
      :readonly="upsertMode !== UpsertDialogMode.CREATE"
      :hint="
        upsertMode === UpsertDialogMode.UPDATE
          ? 'Field type cannot be changed'
          : ''
      "
      :rules="[validationUtils.rules.required]"
    />

    <!-- Card Type -->
    <v-autocomplete
      v-if="fieldDto.type === FieldTypes.CARD"
      v-model="fieldDto.dataCardType"
      :items="cardTypes"
      item-title="name"
      label="Card Type"
      auto-select-first
      autocomplete="off"
      return-object
      :rules="[validationUtils.rules.required]"
    />

    <!-- Associated Lists -->
    <v-autocomplete
      v-if="showListsField"
      v-model="fieldDto.lists"
      :items="lists"
      item-title="name"
      label="Lists"
      auto-select-first
      multiple
      autocomplete="off"
      return-object
      chips
      closable-chips
    />

    <!-- Options -->
    <div class="mb-2">
      <template v-if="fieldDto.cardType && fieldFlags.length">
        <v-checkbox
          v-for="flag in fieldFlags"
          :key="flag.key"
          v-model="fieldDto[flag.key]"
          :label="flag.label"
          density="compact"
          :hint="flag.hint"
          persistent-hint
          :hide-details="false"
          class="mb-2"
        />
      </template>

      <!-- <v-checkbox
            label="Required"
            v-model="fieldDto.required"
            density="compact"
            color="primary"
          /> -->
      <v-checkbox
        v-if="pinnableField"
        label="Pinned"
        v-model="fieldDto.isPinned"
        density="compact"
        hint="Pinned fields appear in cards in your board and list views, as well as when creating a card."
        persistent-hint
        :hide-details="false"
      />
      <v-checkbox
        label="Multiple"
        v-model="fieldDto.multiple"
        density="compact"
        v-if="showIsMultiple"
      />
    </div>

    <!-- Dropdown Items -->
    <template v-if="fieldDto.type === FieldTypes.DROPDOWN">
      <v-divider class="mb-2" />
      <base-array-input
        v-model="fieldDto.items"
        item-type="object"
        item-value="item"
        label="Options"
      />
    </template>
    <!-- Label Choices -->
    <template v-else-if="fieldDto.type === FieldTypes.LABEL">
      <v-divider class="mb-2" />
      <base-array-input
        v-model="fieldDto.items"
        item-type="object"
        item-value="item"
        label="Options"
        item-color
      />
    </template>

    <v-divider class="my-2" />
    <div class="d-flex ga-2">
      <!-- Delete Button -->
      <v-btn
        v-if="upsertMode === UpsertDialogMode.UPDATE"
        class="text-none text-error"
        variant="outlined"
        @click="handleDeleteField"
      >
        Delete
      </v-btn>

      <v-spacer />

      <!-- Upsert Button -->
      <v-btn
        class="text-none"
        :text="upsertMode === UpsertDialogMode.CREATE ? 'Create' : 'Save'"
        variant="flat"
        type="submit"
        :loading="isUpdateOrCreateLoading"
      />
    </div>
  </v-form>
</template>
