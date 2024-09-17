<script setup lang="ts">
import { useFieldsService } from '@/services/useFieldsService';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import { cloneDeep } from 'lodash';
import { VForm } from 'vuetify/components';
import BaseArrayInput from '../inputs/BaseArrayInput.vue';
import BaseIconSelector from '../inputs/BaseIconSelector/BaseIconSelector.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useListsService } from '@/services/useListsService';
import { useCardTypesService } from '@/services/useCardTypesService';
import { DIALOGS, UpsertDialogMode } from '../dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import slugify from 'slugify';
import validationUtils from '@/utils/validation';
import {
  type Field,
  type CreateFieldDto,
  FieldTypes,
  FIELD_TYPE_OPTIONS,
} from '@tillywork/shared';

const selectedField = ref<Field>();
const fieldDto = ref<Partial<Field> | CreateFieldDto>();
const upsertFieldForm = ref<VForm>();
const upsertMode = ref<UpsertDialogMode>();
const isCreating = ref(false);
const slugExistsErrorMessage = ref('');

const isCreatingOrEditing = computed(
  () => !!fieldDto.value || isCreating.value
);

const showIsMultiple = computed(() =>
  [
    FieldTypes.DROPDOWN,
    FieldTypes.LABEL,
    FieldTypes.USER,
    FieldTypes.CARD,
  ].includes(fieldDto.value?.type as FieldTypes)
);

const pinnableField = computed(() =>
  [
    FieldTypes.DROPDOWN,
    FieldTypes.LABEL,
    FieldTypes.USER,
    FieldTypes.DATE,
    FieldTypes.CHECKBOX,
    FieldTypes.NUMBER,
  ].includes(fieldDto.value?.type as FieldTypes)
);

const isUpdateOrCreateLoading = computed(
  () => isUpdateLoading.value || isCreateLoading.value
);

const { showSnackbar } = useSnackbarStore();
const { workspace } = storeToRefs(useAuthStore());

const {
  useFieldsQuery,
  updateFieldMutation,
  createFieldMutation,
  deleteFieldMutation,
} = useFieldsService();
const { data: fields } = useFieldsQuery({
  workspaceId: workspace.value!.id,
  createdByType: 'user',
});
const { mutateAsync: updateField, isPending: isUpdateLoading } =
  updateFieldMutation();
const { mutateAsync: createField, isPending: isCreateLoading } =
  createFieldMutation();
const { mutateAsync: deleteField } = deleteFieldMutation();

const { useGetListsQuery } = useListsService();
const { data: lists } = useGetListsQuery({
  workspaceId: workspace.value!.id,
  throughSpace: true,
});

const { useFindAllQuery } = useCardTypesService();
const { data: cardTypes } = useFindAllQuery({
  workspaceId: workspace.value!.id,
});

const dialog = useDialogStore();
const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

function handleFieldClick(field: Field) {
  selectedField.value = cloneDeep(field);
  upsertMode.value = UpsertDialogMode.UPDATE;
}

function clearSelectedField() {
  selectedField.value = undefined;
  fieldDto.value = undefined;
  isCreating.value = false;
  slugExistsErrorMessage.value = '';
}

async function saveField() {
  if (!fieldDto.value) {
    return;
  }

  const isValid = await upsertFieldForm.value?.validate();
  if (!isValid?.valid) {
    return;
  }

  switch (upsertMode.value) {
    case UpsertDialogMode.UPDATE:
      updateField(fieldDto.value as Partial<Field>)
        .then(() => {
          clearSelectedField();
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
          clearSelectedField();
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

function handleCreateField() {
  upsertMode.value = UpsertDialogMode.CREATE;
  isCreating.value = true;
  fieldDto.value = {
    name: '',
    workspaceId: workspace.value!.id,
  };
  slugExistsErrorMessage.value = '';
}

function handleDeleteField() {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Confirm',
      message: `Are you sure you want to delete this field (${fieldDto.value?.name})?`,
      onConfirm: () =>
        deleteField((fieldDto.value as Field).id)
          .then(() => {
            dialog.closeDialog(confirmDialogIndex.value);
            clearSelectedField();
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

function getFieldCreatedByName(field: Field) {
  return field.createdByType === 'system'
    ? 'System'
    : field.createdBy?.firstName + ' ' + field.createdBy?.lastName;
}

function getFieldCreatedByPhoto(field: Field) {
  return field.createdByType === 'system'
    ? useLogo().getCheckUrl()
    : field.createdBy?.photo;
}

watch(selectedField, (v) => {
  fieldDto.value = cloneDeep(v);
});

watch(
  () => fieldDto.value?.name,
  (v) => {
    if (v && upsertMode.value === 'create' && fieldDto.value?.name) {
      fieldDto.value!.slug = slugify(fieldDto.value.name, {
        lower: true,
        replacement: '_',
        strict: true,
      });
    }
  }
);
</script>

<template>
  <template v-if="!isCreatingOrEditing">
    <div class="user-select-none">
      <div class="d-flex ga-2">
        <h3>Custom Fields</h3>
        <base-icon-btn @click="handleCreateField" />
      </div>
      <p class="text-subtitle-2 mb-2">
        Create custom fields, and assign them to lists.
      </p>
    </div>

    <v-divider class="my-6" />

    <base-table
      :data="fields ?? []"
      :columns="[
        {
          header: 'Name',
          id: 'name',
          accessorKey: 'name',
        },
        {
          header: 'Type',
          id: 'type',
          accessorKey: 'type',
        },
        {
          header: 'Lists',
          id: 'lists',
          accessorKey: 'lists',
        },
        {
          id: 'createdBy',
          header: 'Created By',
          accessorKey: 'createdBy',
          size: 300,
        },
      ]"
      @click:row="handleFieldClick"
    >
      <!-- ~ Name -->
      <template #name="{ row }">
        <v-icon :icon="row.original.icon" class="me-4" />
        <span class="text-body-3">{{ row.original.name }}</span>
      </template>

      <!-- ~ Type -->
      <template #type="{ row }">
        <span class="text-body-3 text-capitalize">
          {{
            FIELD_TYPE_OPTIONS.find(
              (option) => option.value === row.original.type
            )?.title
          }}
        </span>
      </template>

      <!-- ~ Lists -->
      <template #lists="{ row }">
        <template v-for="list in row.original.lists" :key="list.id">
          <v-chip class="me-1 text-caption" density="compact">{{
            list.name
          }}</v-chip>
        </template>
      </template>

      <!-- ~ Created By -->
      <template #createdBy="{ row }">
        <v-card class="py-2">
          <base-avatar
            :photo="getFieldCreatedByPhoto(row.original)"
            :text="getFieldCreatedByName(row.original)"
            rounded="circle"
            :class="
              row.original.createdByType === 'system' ? 'pa-1 bg-accent' : ''
            "
          />
          <span class="text-body-3 ms-3">
            {{ getFieldCreatedByName(row.original) }}
          </span>
        </v-card>
      </template>
    </base-table>
  </template>

  <template v-else>
    <v-card width="300">
      <v-form ref="upsertFieldForm" @submit.prevent="saveField" v-if="fieldDto">
        <div class="user-select-none">
          <h3 class="d-flex align-start flex-column ga-2">
            <v-btn
              class="text-capitalize mb-2"
              prepend-icon="mdi-chevron-left"
              text="Back"
              variant="text"
              density="comfortable"
              @click="clearSelectedField"
            />
            <span>
              <span class="text-capitalize">{{ upsertMode }}</span>
              field
            </span>
          </h3>
          <p class="mb-4 text-subtitle-2">General</p>
        </div>

        <!-- ~ Field Name -->
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

        <!-- ~ Field Type -->
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

        <!-- ~ Card Type -->
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

        <!-- ~ Associated Lists -->
        <v-autocomplete
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

        <!-- ~ Options -->
        <div class="mb-2">
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
          />
          <v-checkbox
            label="Multiple"
            v-model="fieldDto.multiple"
            density="compact"
            v-if="showIsMultiple"
          />
        </div>

        <!-- ~ Dropdown Items -->
        <template v-if="fieldDto.type === FieldTypes.DROPDOWN">
          <v-divider class="mb-2" />
          <base-array-input
            v-model="fieldDto.items"
            item-type="object"
            item-value="item"
            label="Options"
          />
        </template>
        <!-- ~ Label Choices -->
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
          <!-- ~ Delete Button -->
          <v-btn
            v-if="upsertMode === UpsertDialogMode.UPDATE"
            class="text-none text-error"
            variant="outlined"
            @click="handleDeleteField"
          >
            Delete
          </v-btn>

          <v-spacer />

          <!-- ~ Upsert Button -->
          <v-btn
            class="text-none"
            :text="upsertMode === UpsertDialogMode.CREATE ? 'Create' : 'Save'"
            variant="flat"
            type="submit"
            :loading="isUpdateOrCreateLoading"
          />
        </div>
      </v-form>
    </v-card>
  </template>
</template>
