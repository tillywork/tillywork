<script setup lang="ts">
import { useCardTypesService } from '@/services/useCardTypesService';
import { useFieldsService } from '@/services/useFieldsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAuthStore } from '@/stores/auth';

import { useFields } from '@/composables/useFields';
import { useCreatedBy } from '@/composables/useCreatedBy';

import {
  CardTypeLayout,
  type CardType,
  type Field,
  type CreateFieldDto,
  FieldTypes,
  FIELD_TYPE_OPTIONS,
} from '@tillywork/shared';
import type { ContextMenuItem } from '../base/ContextMenu/types';
import { UpsertDialogMode } from '../dialogs/types';

import validationUtils from '@/utils/validation';
import { cloneDeep } from 'lodash';

import { VForm } from 'vuetify/components';
import SimpleDropdownSelector from '../inputs/SimpleDropdownSelector.vue';
import UpsertField from '../fields/UpsertField.vue';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import MenuWrapper from '../base/ContextMenu/MenuWrapper.vue';

const props = defineProps<{
  cardType: CardType;
}>();

const cardTypeForm = ref<VForm>();
const cardTypeCopy = ref<CardType>(cloneDeep(props.cardType));
const fieldUpsertMode = ref<UpsertDialogMode | null>(null);
const isEditingField = ref(false);
const selectedField = ref<Field | CreateFieldDto>();
const titleMode = ref<'single' | 'template'>('single');
const selectedTitleField = ref<Field | null>(null);
const showFieldInsertDropdown = ref(false);

const { showSnackbar } = useSnackbarStore();
const { workspace } = storeToRefs(useAuthStore());

const { useUpdateCardType } = useCardTypesService();
const { mutateAsync: updateCardType, isPending: isUpdatingCardType } =
  useUpdateCardType();

const { updateFieldMutation } = useFieldsService();

const { mutateAsync: updateField } = updateFieldMutation();

const { cardTypeFields, titleField } = useFields({
  cardTypeId: computed(() => props.cardType.id),
});
const { getCreatedByName, getCreatedByPhoto } = useCreatedBy();

const layoutOptions: ContextMenuItem[] = [
  { title: 'Default', value: CardTypeLayout.DEFAULT, icon: 'mdi-text-box' },
  { title: 'Person', value: CardTypeLayout.PERSON, icon: 'mdi-account' },
  {
    title: 'Organization',
    value: CardTypeLayout.ORGANIZATION,
    icon: 'mdi-domain',
  },
  { title: 'Deal', value: CardTypeLayout.DEAL, icon: 'mdi-handshake' },
];

const titleFieldOptions = computed(
  () =>
    cardTypeFields.value
      ?.filter((field) => field.type === FieldTypes.TEXT)
      .map((field) => ({
        title: field.name,
        value: field,
        icon: field.icon,
      })) ?? []
);

async function saveCardType() {
  const isValid = await cardTypeForm.value?.validate();
  if (!isValid?.valid) return;

  updateCardType({
    id: cardTypeCopy.value.id,
    name: cardTypeCopy.value.name,
    layout: cardTypeCopy.value.layout,
    hasChildren: cardTypeCopy.value.hasChildren,
    titleTemplate: cardTypeCopy.value.titleTemplate,
  })
    .then(() => {
      showSnackbar({
        message: 'Card type updated successfully',
        color: 'success',
      });
    })
    .catch(() => {
      showSnackbar({
        message: 'Failed to update card type',
        color: 'error',
      });
    });
}

function handleFieldClick(field: Field) {
  selectedField.value = cloneDeep(field);
  isEditingField.value = true;
  fieldUpsertMode.value = UpsertDialogMode.UPDATE;
}

function handleCreateField() {
  selectedField.value = {
    name: '',
    slug: '',
    type: FieldTypes.TEXT,
    icon: 'mdi-text',
    workspaceId: workspace.value!.id,
    cardType: cardTypeCopy.value,
    required: false,
    multiple: false,
    isTitle: false,
    isDescription: false,
    isPhoto: false,
    isAssignee: false,
    isPinned: false,
    createdByType: 'user',
  } as CreateFieldDto;
  isEditingField.value = true;
  fieldUpsertMode.value = UpsertDialogMode.CREATE;
}

function clearSelectedField() {
  selectedField.value = undefined;
  isEditingField.value = false;
  fieldUpsertMode.value = null;
}

function insertFieldPlaceholder(slug: string) {
  const placeholder = `{{${slug}}}`;
  if (!cardTypeCopy.value.titleTemplate) {
    cardTypeCopy.value.titleTemplate = placeholder;
  } else {
    cardTypeCopy.value.titleTemplate += ` ${placeholder}`;
  }
  showFieldInsertDropdown.value = false;
}

async function handleUpdateTitleField(newTitleField: Field | null) {
  if (newTitleField?.id === titleField.value?.id) {
    return;
  }

  if (titleField.value) {
    await updateField({
      id: titleField.value.id,
      isTitle: false,
    });
  }

  if (newTitleField) {
    await updateField({
      id: newTitleField.id,
      isTitle: true,
    });

    titleMode.value = 'single';
    cardTypeCopy.value.titleTemplate = '';
  }
}

watch(
  () => props.cardType,
  (newValue) => {
    cardTypeCopy.value = cloneDeep(newValue);
  }
);

watch(
  () => cardTypeCopy.value.titleTemplate,
  (newTemplate) => {
    if (newTemplate && newTemplate.trim() !== '') {
      titleMode.value = 'template';
      selectedTitleField.value = null;
    }
  }
);

watch(selectedTitleField, handleUpdateTitleField);

watch(
  titleField,
  (field) => {
    if (field) {
      selectedTitleField.value = field;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-card class="pa-4">
      <div class="user-select-none">
        <div class="d-flex items-center ga-2">
          <h3>{{ cardTypeCopy?.name ?? 'Card type' }} settings</h3>
        </div>

        <p class="text-subtitle-2 mb-2 text-color-subtitle">
          Update your {{ cardTypeCopy?.name ?? 'Card type' }} fields, layout,
          and configure it to your needs.
        </p>
      </div>

      <v-divider class="my-6" />

      <v-form ref="cardTypeForm" @submit.prevent="saveCardType">
        <p class="text-body-2 text-high-emphasis mb-6">Display</p>

        <v-row>
          <v-col cols="12" md="6">
            <!-- Name -->
            <p class="text-caption text-color-subtitle mb-2">Name*</p>
            <v-text-field
              v-model="cardTypeCopy.name"
              :rules="[validationUtils.rules.required]"
              max-width="300"
              rounded="md"
            />
          </v-col>

          <v-col cols="12" md="6">
            <!-- Layout -->
            <p class="text-caption text-color-subtitle mb-2">Layout*</p>
            <SimpleDropdownSelector
              v-model="cardTypeCopy.layout"
              label="Layout*"
              :items="layoutOptions"
              rounded="md"
            />
          </v-col>

          <v-col cols="12" md="6">
            <!-- Title Template -->
            <p class="text-caption text-color-subtitle mb-2">Title setting</p>

            <v-radio-group v-model="titleMode" row>
              <v-radio label="Single field" value="single" />
              <v-radio label="Custom template" value="template" />
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="6">
            <div v-if="titleMode === 'single'">
              <p class="text-caption text-color-subtitle mb-2">Title field</p>
              <SimpleDropdownSelector
                v-model="selectedTitleField"
                label="Select field"
                :items="titleFieldOptions"
                rounded="md"
                clearable
              />
            </div>

            <div v-else>
              <p class="text-caption text-color-subtitle mb-2">
                Title template
              </p>
              <v-menu v-model="showFieldInsertDropdown" max-width="200">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="cardTypeCopy.titleTemplate"
                    placeholder="{{first_name}} {{last_name}}"
                    rounded="md"
                    hide-details
                  />
                </template>
                <menu-wrapper
                  :items="
                    cardTypeFields?.map((field) => ({
                      title: field.name,
                      icon: field.icon,
                      action: () => insertFieldPlaceholder(field.slug),
                    }))
                  "
                />
              </v-menu>
            </div>
          </v-col>

          <v-col cols="12" md="12">
            <p class="text-body-2 text-high-emphasis mb-4">Config</p>
            <!-- Has Children -->
            <v-checkbox
              v-model="cardTypeCopy.hasChildren"
              label="Has children"
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              class="text-none"
              type="submit"
              color="primary"
              :loading="isUpdatingCardType"
            >
              Save Changes
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <v-divider />

    <!-- Fields List -->
    <v-card class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <p class="text-body-2 text-high-emphasis">Fields</p>
        <v-btn
          class="text-none text-caption"
          prepend-icon="mdi-plus"
          :disabled="isEditingField"
          variant="outlined"
          size="small"
          @click="handleCreateField"
        >
          Add Field
        </v-btn>
      </div>

      <base-table
        v-if="!isEditingField"
        :data="
          cardTypeFields?.map((field) => ({
            ...field,
            cardType: cardTypeCopy,
          })) ?? []
        "
        :columns="[
          {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
          },
          {
            id: 'type',
            header: 'Type',
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
        <template #name="{ row }">
          <div class="d-flex align-center">
            <v-icon :icon="row.original.icon" class="me-2" />
            {{ row.original.name }}
          </div>
        </template>
        <template #type="{ row }">
          {{
            FIELD_TYPE_OPTIONS.find((opt) => opt.value === row.original.type)
              ?.title
          }}
        </template>
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

      <!-- Field Editor -->
      <v-card v-else width="100%" max-width="400px" class="mx-auto">
        <UpsertField
          v-if="selectedField && fieldUpsertMode"
          v-model="selectedField"
          :upsert-mode="fieldUpsertMode"
          @close="clearSelectedField"
        />
      </v-card>
    </v-card>
  </div>
</template>
