<script setup lang="ts">
import { useCreatedBy } from '@/composables/useCreatedBy';

import { useFieldsService } from '@/services/useFieldsService';

import { useAuthStore } from '@/stores/auth';

import {
  type Field,
  type CreateFieldDto,
  FIELD_TYPE_OPTIONS,
} from '@tillywork/shared';
import { UpsertDialogMode } from '../dialogs/types';

import { cloneDeep } from 'lodash';
import slugify from 'slugify';

import BaseTable from '../tables/BaseTable/BaseTable.vue';
import UpsertField from '../fields/UpsertField.vue';

const selectedField = ref<Field>();
const fieldDto = ref<Partial<Field> | CreateFieldDto>();
const upsertMode = ref<UpsertDialogMode>();
const isCreating = ref(false);
const slugExistsErrorMessage = ref('');

const isCreatingOrEditing = computed(
  () => !!fieldDto.value || isCreating.value
);

const { workspace } = storeToRefs(useAuthStore());

const { getCreatedByName, getCreatedByPhoto } = useCreatedBy();

const { useFieldsQuery } = useFieldsService();
const { data: fields } = useFieldsQuery({
  workspaceId: workspace.value!.id,
  excludeCardTypes: true,
});

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

function handleCreateField() {
  upsertMode.value = UpsertDialogMode.CREATE;
  isCreating.value = true;
  fieldDto.value = {
    name: '',
    workspaceId: workspace.value!.id,
  };
  slugExistsErrorMessage.value = '';
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
      <p class="text-subtitle-2 mb-2 text-color-subtitle">
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
            :photo="getCreatedByPhoto(row.original)"
            :text="getCreatedByName(row.original)"
            rounded="circle"
            :class="
              row.original.createdByType === 'system' ? 'pa-1 bg-accent' : ''
            "
          />
          <span class="text-body-3 ms-3">
            {{ getCreatedByName(row.original) }}
          </span>
        </v-card>
      </template>
    </base-table>
  </template>

  <template v-else>
    <v-card width="300">
      <UpsertField
        v-if="fieldDto && upsertMode"
        v-model="fieldDto"
        :upsertMode
        @close="clearSelectedField"
      />
    </v-card>
  </template>
</template>
