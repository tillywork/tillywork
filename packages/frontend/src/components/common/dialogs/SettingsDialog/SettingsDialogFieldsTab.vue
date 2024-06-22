<script setup lang="ts">
import { useFieldsService } from '@/composables/services/useFieldsService';
import { useWorkspaceStore } from '@/stores/workspace';
import BaseTable from '../../tables/BaseTable/BaseTable.vue';
import {
  FIELD_TYPE_OPTIONS,
  type Field,
} from '@/components/project-management/fields/types';
import { cloneDeep } from 'lodash';
import { VForm } from 'vuetify/components';
import { FieldTypes } from '@/components/project-management/fields/types';
import BaseArrayInput from '../../inputs/BaseArrayInput.vue';
import { useSnackbarStore } from '@/stores/snackbar';

const selectedField = ref<Field>();
const fieldDto = ref<Partial<Field>>();
const upsertFieldForm = ref<VForm>();
const upsertMode = ref<'Create' | 'Edit'>();
const isCreating = ref(false);

const isCreatingOrEditing = computed(
  () => !!fieldDto.value || isCreating.value
);

const showIsMultiple = computed(() =>
  [FieldTypes.DROPDOWN].includes(fieldDto.value?.type as FieldTypes)
);

const { showSnackbar } = useSnackbarStore();
const { selectedWorkspace } = storeToRefs(useWorkspaceStore());

const { useFieldsQuery, updateFieldMutation, createFieldMutation } =
  useFieldsService();
const { data: fields } = useFieldsQuery({
  workspaceId: selectedWorkspace.value!.id,
});
const { mutateAsync: updateField } = updateFieldMutation();
const { mutateAsync: createField } = createFieldMutation();

function handleFieldClick(field: Field) {
  selectedField.value = cloneDeep(field);
  upsertMode.value = 'Edit';
}

function clearSelectedField() {
  selectedField.value = undefined;
  fieldDto.value = undefined;
  isCreating.value = false;
}

function saveField() {
  if (upsertMode.value === 'Edit') {
    updateField(fieldDto.value)
      .then((field) => {
        selectedField.value = field;
      })
      .catch(() =>
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
        })
      );
  } else {
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
  }
}

function handleCreateField() {
  upsertMode.value = 'Create';
  isCreating.value = true;
  fieldDto.value = {
    name: '',
    workspaceId: selectedWorkspace.value!.id,
  };
}

watch(selectedField, (v) => {
  fieldDto.value = cloneDeep(v);
});
</script>

<template>
  <v-card max-width="100%" min-width="300">
    <template v-if="!isCreatingOrEditing">
      <v-card-title class="d-flex align-center">
        Custom Fields
        <base-icon-btn @click="handleCreateField" class="ms-4" />
      </v-card-title>
      <v-card-subtitle
        >Create custom fields, and assign them to lists.</v-card-subtitle
      >
      <v-card-text>
        <base-table
          :data="fields ?? []"
          :columns="[
            {
              header: 'Name',
              id: 'name',
              accessorKey: 'name',
            },
          ]"
          @click:row="handleFieldClick"
        />
      </v-card-text>
    </template>
    <template v-else>
      <v-form ref="upsertFieldForm" @submit.prevent="saveField" v-if="fieldDto">
        <v-card-title class="d-flex align-start flex-column ga-2">
          <v-btn
            class="text-capitalize mb-2"
            prepend-icon="mdi-chevron-left"
            text="Back"
            variant="text"
            density="comfortable"
            @click="clearSelectedField"
          />
          {{ upsertMode }} {{ selectedField?.name ?? 'field' }}
        </v-card-title>
        <v-card-item>
          <v-card-subtitle class="mb-2">General</v-card-subtitle>

          <v-text-field v-model="fieldDto.name" label="Field name*" />

          <v-autocomplete
            v-model="fieldDto.type"
            :items="FIELD_TYPE_OPTIONS"
            label="Field type*"
          />

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

          <template v-if="fieldDto.type === FieldTypes.DROPDOWN">
            <v-divider class="mb-2" />
            <base-array-input
              v-model="fieldDto.items"
              item-type="object"
              item-value="item"
              label="Options"
            />
          </template>

          <v-divider class="mt-2" />
        </v-card-item>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            class="text-capitalize"
            :text="upsertMode === 'Create' ? 'Create' : 'Save'"
            variant="flat"
            type="submit"
          />
        </v-card-actions>
      </v-form>
    </template>
  </v-card>
</template>
