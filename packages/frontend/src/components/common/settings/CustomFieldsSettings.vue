<script setup lang="ts">
import { useFieldsService } from '@/composables/services/useFieldsService';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import {
  FIELD_TYPE_OPTIONS,
  type Field,
} from '@/components/project-management/fields/types';
import { cloneDeep } from 'lodash';
import { VForm } from 'vuetify/components';
import { FieldTypes } from '@/components/project-management/fields/types';
import BaseArrayInput from '../inputs/BaseArrayInput.vue';
import BaseIconSelector from '../inputs/BaseIconSelector/BaseIconSelector.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useListsService } from '@/composables/services/useListsService';
import { useCardTypesService } from '@/composables/services/useCardTypesService';
import { UpsertDialogMode } from '../dialogs/types';

const selectedField = ref<Field>();
const fieldDto = ref<Partial<Field>>();
const upsertFieldForm = ref<VForm>();
const upsertMode = ref<UpsertDialogMode>();
const isCreating = ref(false);

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
});
const { mutateAsync: updateField } = updateFieldMutation();
const { mutateAsync: createField } = createFieldMutation();
const { mutateAsync: deleteField } = deleteFieldMutation();

const { useGetListsQuery } = useListsService();
const { data: lists } = useGetListsQuery({
  workspaceId: workspace.value!.id,
});

const { useFindAllQuery } = useCardTypesService();
const { data: cardTypes } = useFindAllQuery({
  workspaceId: workspace.value!.id,
});

function handleFieldClick(field: Field) {
  selectedField.value = cloneDeep(field);
  upsertMode.value = UpsertDialogMode.UPDATE;
}

function clearSelectedField() {
  selectedField.value = undefined;
  fieldDto.value = undefined;
  isCreating.value = false;
}

function saveField() {
  switch (upsertMode.value) {
    case UpsertDialogMode.UPDATE:
      updateField(fieldDto.value)
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
      createField(fieldDto.value)
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
  }
}

function handleCreateField() {
  upsertMode.value = UpsertDialogMode.CREATE;
  isCreating.value = true;
  fieldDto.value = {
    name: '',
    workspaceId: workspace.value!.id,
  };
}

function handleDeleteField() {
  deleteField(fieldDto.value!.id!)
    .then(() => {
      clearSelectedField;
    })
    .catch(() =>
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      })
    );
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
</script>

<template>
  <v-card class="pa-4" height="100%">
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
            <v-chip class="me-1" density="compact">{{ list.name }}</v-chip>
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
        <v-form
          ref="upsertFieldForm"
          @submit.prevent="saveField"
          v-if="fieldDto"
        >
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
          <v-text-field v-model="fieldDto.name" label="Field name*">
            <template #prepend-inner>
              <base-icon-selector v-model="fieldDto.icon" />
            </template>
          </v-text-field>

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
          />

          <!-- ~ Card Type -->
          <v-autocomplete
            v-if="fieldDto.type === FieldTypes.CARD"
            v-model="fieldDto.cardType"
            :items="cardTypes"
            item-title="name"
            label="Card Type"
            auto-select-first
            autocomplete="off"
            return-object
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
            <v-checkbox
              label="Required"
              v-model="fieldDto.required"
              density="compact"
              color="primary"
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
          <div class="d-flex justify-end ga-2">
            <!-- ~ Upsert Button -->
            <v-btn
              class="text-capitalize"
              :text="upsertMode === UpsertDialogMode.CREATE ? 'Create' : 'Save'"
              variant="flat"
              type="submit"
            />

            <!-- ~ Delete Button -->
            <v-btn
              v-if="upsertMode === UpsertDialogMode.UPDATE"
              class="text-capitalize text-error"
              variant="outlined"
              @click="handleDeleteField"
            >
              Delete
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </template>
  </v-card>
</template>
