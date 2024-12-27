<script setup lang="ts">
import { useViewsService } from '@/services/useViewsService';
import BaseViewChip from './BaseViewChip.vue';
import { useFields } from '@/composables/useFields';
import { type Field, type List, type View, ViewTypes } from '@tillywork/shared';
import { cloneDeep } from 'lodash';
import draggable from 'vuedraggable';
import { useSnackbarStore } from '@/stores/snackbar';
import posthog from 'posthog-js';

const view = defineModel<View>({
  required: true,
});
const { list } = defineProps<{
  list: List;
}>();

const listId = computed(() => view.value.listId);

const { showSnackbar } = useSnackbarStore();

const { useUpdateViewMutation } = useViewsService();
const { mutateAsync: updateView } = useUpdateViewMutation();

const cardTypeId = computed(() => list.defaultCardType.id);

const { titleField, tableFields, sortFieldsByViewColumns } = useFields({
  cardTypeId,
  listId,
});

const enabledTableColumns = computed({
  get() {
    return sortFieldsByViewColumns(
      tableFields.value?.filter((field) => isColumnEnabledInView(field)),
      view.value.options.columns ?? []
    );
  },
  set(v) {
    const newColumnOrder = v.map((field) => field.id.toString());
    view.value.options.columns = newColumnOrder;
    posthog.capture('order_table_columns', { viewId: view.value.id });

    updateView(view.value).catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    });
  },
});

const disabledTableColumns = computed(() =>
  tableFields.value?.filter((field) => !isColumnEnabledInView(field))
);

function handleToggleCompleted() {
  posthog.capture('toggle_hide_completed', {
    viewId: view.value.id,
    value: !view.value.options.hideCompleted,
  });

  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      hideCompleted: !view.value.options.hideCompleted,
    },
  });
}

function handleToggleChildren() {
  posthog.capture('toggle_hide_children', {
    viewId: view.value.id,
    value: !view.value.options.hideChildren,
  });

  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      hideChildren: !view.value.options.hideChildren,
    },
  });
}

function isColumnEnabledInView(field: Field) {
  return view.value.options.columns?.includes(field.id.toString());
}

function handleToggleColumn(field: Field) {
  posthog.capture('toggle_table_column', {
    viewId: view.value.id,
  });

  let viewColumns = cloneDeep(view.value.options.columns) ?? [];
  const columnIndex = viewColumns?.findIndex(
    (fieldId) => fieldId === field.id.toString()
  );

  if (columnIndex === -1) {
    viewColumns?.push(field.id.toString());
  } else {
    viewColumns = [
      ...viewColumns.slice(0, columnIndex),
      ...viewColumns.slice(columnIndex + 1),
    ];
  }

  updateView({
    id: view.value.id,
    options: {
      ...view.value.options,
      columns: viewColumns,
    },
  });
}
</script>

<template>
  <base-view-chip icon="mdi-eye" label="Display" is-filled>
    <v-menu activator="parent" :close-on-content-click="false">
      <v-card>
        <v-list>
          <v-list-item @click="handleToggleCompleted">
            <template #append>
              <v-switch
                :model-value="!view.options.hideCompleted"
                readonly
                inset
                hide-details
                density="compact"
                class="ms-2"
              />
            </template>
            <v-list-item-title> Show completed </v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleToggleChildren">
            <template #append>
              <v-switch
                :model-value="!view.options.hideChildren"
                readonly
                inset
                hide-details
                density="compact"
                class="ms-2"
              />
            </template>
            <v-list-item-title>
              Show sub {{ list?.defaultCardType.name.toLowerCase() }}s
            </v-list-item-title>
          </v-list-item>
          <v-menu
            :close-on-content-click="false"
            location="end"
            width="225"
            v-if="view.type === ViewTypes.TABLE"
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <v-list-item-title>Fields</v-list-item-title>
                <template #append>
                  <v-icon icon="mdi-chevron-right" />
                </template>
              </v-list-item>
            </template>
            <v-card max-height="400">
              <v-list :lines="false">
                <v-list-subheader> Table Fields </v-list-subheader>
                <v-list-item disabled v-if="titleField">
                  <template #prepend>
                    <v-icon icon="mdi-drag-horizontal-variant" disabled />
                  </template>
                  <v-list-item-title>
                    <v-icon :icon="titleField.icon" class="me-2" />
                    {{ titleField.name }}</v-list-item-title
                  >
                  <template #append>
                    <v-switch
                      :model-value="true"
                      readonly
                      inset
                      hide-details
                      density="compact"
                      class="ms-2"
                    />
                  </template>
                </v-list-item>
                <draggable
                  v-model="enabledTableColumns"
                  :delay="300"
                  delay-on-touch-only
                  :touch-start-threshold="5"
                  item-key="id"
                  animation="100"
                  ghost-class="v-list-item--active"
                  handle=".handle"
                >
                  <template #item="{ element: field }">
                    <v-list-item @click="handleToggleColumn(field)">
                      <template #prepend>
                        <v-icon
                          class="handle cursor-grab"
                          icon="mdi-drag-horizontal-variant"
                        />
                      </template>
                      <v-list-item-title>
                        <v-icon :icon="field.icon" class="me-2" />
                        {{ field.name }}</v-list-item-title
                      >
                      <template #append>
                        <v-switch
                          :model-value="isColumnEnabledInView(field)"
                          inset
                          hide-details
                          density="compact"
                          class="ms-2"
                          @update:modelValue="handleToggleColumn(field)"
                        />
                      </template>
                    </v-list-item>
                  </template>
                </draggable>
                <v-list-subheader
                  class="mt-2"
                  v-if="disabledTableColumns.length"
                  >All Fields</v-list-subheader
                >
                <template v-for="field in disabledTableColumns" :key="field.id">
                  <v-list-item @click="handleToggleColumn(field)">
                    <template #prepend>
                      <v-icon icon="mdi-drag-horizontal-variant" disabled />
                    </template>
                    <v-list-item-title>
                      <v-icon :icon="field.icon" class="me-2" />
                      {{ field.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-switch
                        :model-value="isColumnEnabledInView(field)"
                        inset
                        hide-details
                        density="compact"
                        class="ms-2"
                        @update:modelValue="handleToggleColumn(field)"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-menu>
        </v-list>
      </v-card>
    </v-menu>
  </base-view-chip>
</template>
