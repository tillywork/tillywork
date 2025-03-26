<script setup lang="ts">
import {
  type Field,
  type FieldFilter,
  type FieldItem,
  type FilterOperator,
  type User,
  FieldTypes,
} from '@tillywork/shared';

import { useQueryStore } from '@/stores/query';
import { useFieldQueryStore } from '@/stores/field.query';

import { useFieldContextMenu } from '@/composables/useFieldContextMenu';

import { useUsersService } from '@/services/useUsersService';

import { type ContextMenuItem } from '../base/ContextMenu/types';

import ContextMenu from '../base/ContextMenu/ContextMenu.vue';

type DropdownItem = { title: string; value: string };

const emit = defineEmits(['delete']);

const filter = defineModel<FieldFilter>({
  default: {},
});

const { getUserFullName } = useUsersService();

const selectedField = ref<Field | null>(null);
const filteringOption = ref<DropdownItem | null>(null);
const selectedItem = ref<User | FieldItem | (FieldItem | User)[] | null>(null);

const { users } = storeToRefs(useQueryStore());
const { filterableFields } = storeToRefs(useFieldQueryStore());

const { getFieldMenuItem } = useFieldContextMenu();

const fieldOptions = computed<ContextMenuItem[]>(() => {
  return filterableFields.value.map((field) =>
    getFieldMenuItem({
      field,
      action: () => handleSelectField(field),
    })
  );
});

const selectedItemLabel = computed<string>(() => {
  if (
    !selectedItem.value ||
    (Array.isArray(selectedItem.value) && selectedItem.value.length === 0)
  )
    return 'value';

  if (Array.isArray(selectedItem.value)) {
    if (selectedItem.value.length === 1) {
      return getItemLabel(selectedItem.value[0]);
    }

    return `${selectedItem.value.length} items`;
  }

  return getItemLabel(selectedItem.value);
});

const isUserItem = computed(
  () => selectedField.value?.type === FieldTypes.USER
);

const hideValueInput = computed(() => {
  return ['isNull', 'isNotNull'].includes(filteringOption.value?.value ?? '');
});

const textOperators = [
  {
    title: 'Is',
    value: 'eq',
  },
  {
    title: 'Includes',
    value: 'like',
  },
  {
    title: 'Starts With',
    value: 'like%',
  },
  {
    title: 'Ends With',
    value: '%like',
  },
];

const arrayOptions = [
  {
    title: 'Is',
    value: 'between',
  },
  {
    title: 'Is not',
    value: 'nbetween',
  },
  {
    title: 'Is empty',
    value: 'isNull',
  },
  {
    title: 'Is not empty',
    value: 'isNotNull',
  },
];

const checkboxOptions = [
  {
    title: 'Is true',
    value: 'isTrue',
  },
  {
    title: 'Is false',
    value: 'isFalse',
  },
];

const numberOperators = [
  {
    title: 'Is',
    value: 'eq',
  },
  {
    title: 'Less Than',
    value: 'lt',
  },
  {
    title: 'Greater Than',
    value: 'gt',
  },
  {
    title: 'Is empty',
    value: 'isNull',
  },
  {
    title: 'Is not empty',
    value: 'isNotNull',
  },
];

const filteringOptionMenuItems = computed<ContextMenuItem[]>(() => {
  let items: ContextMenuItem[] = [];
  let itemsToUse: DropdownItem[] = [];

  switch (selectedField.value?.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      itemsToUse = arrayOptions;
      break;

    case FieldTypes.CHECKBOX:
      itemsToUse = checkboxOptions;
      break;
    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
    case FieldTypes.NUMBER:
    case FieldTypes.CURRENCY:
    case FieldTypes.PERCENTAGE:
      itemsToUse = numberOperators;
      break;
    default:
      itemsToUse = textOperators;
      break;
  }

  items = itemsToUse.map((option) => ({
    title: option.title,
    action: () => handleSelectFilteringOption(option),
    value: option.value,
  }));

  return items;
});

const valueItems = computed<ContextMenuItem[]>(() => {
  if (isUserItem.value) {
    const userItems: ContextMenuItem[] =
      users.value?.map((u) => ({
        title: getUserFullName(u),
        photo: u.photo,
        avatar: true,
        value: u,
      })) ?? [];

    return userItems;
  }

  const fieldItems: ContextMenuItem[] =
    selectedField.value?.items?.map((item) => ({
      title: item.item,
      icon: 'mdi-circle',
      color: item.color,
      value: item,
    })) ?? [];

  return fieldItems;
});

/**
 * Returns the correct operator
 * depending on selected filtering
 * option.
 */
function mapSelectedFileringOptionToOperator(): FilterOperator | null {
  if (!filteringOption.value || !selectedField.value) return null;
  const value = filteringOption.value.value;

  switch (selectedField.value.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      if (value === 'between') {
        return 'in';
      } else if (value === 'nbetween') {
        return 'nin';
      } else {
        return value as FilterOperator;
      }
    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
    case FieldTypes.NUMBER:
    default:
      return value as FilterOperator;
  }
}

/**
 * Returns the correct filter option
 * depending on filter type
 * based on the filter operator
 * value.
 * @param value Value of the operator to map
 */
function mapFilterOperatorToFileringOption(): FilterOperator {
  const operator = filter.value.operator;

  switch (selectedField.value?.type) {
    case FieldTypes.USER:
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.CARD:
      if (operator === 'in') {
        return 'between';
      } else if (operator === 'nin') {
        return 'nbetween';
      } else {
        return operator as FilterOperator;
      }
    case FieldTypes.CHECKBOX:
      if (operator === 'eq') {
        return 'isTrue' as FilterOperator;
      } else if (operator === 'neOrNull') {
        return 'isFalse' as FilterOperator;
      }
      return 'isTrue' as FilterOperator;
    case FieldTypes.DATETIME:
    case FieldTypes.DATE:
    case FieldTypes.NUMBER:
    default:
      return operator as FilterOperator;
  }
}

function handleSelectField(field: Field) {
  selectedField.value = field;

  filteringOptionMenuItems.value[0].action?.();

  filter.value = {
    value: undefined,
    field: `card.data.${field.slug}`,
    operator: mapSelectedFileringOptionToOperator() ?? 'eq',
  };
}

function handleSelectFilteringOption(option: DropdownItem) {
  filteringOption.value = option;
  filter.value = {
    ...filter.value,
    operator: mapSelectedFileringOptionToOperator() ?? 'eq',
  };
}

function getItemLabel(item: FieldItem | User) {
  if ('email' in item) {
    return getUserFullName(item);
  }

  return item.item;
}

function getItemValue(item: FieldItem | User) {
  return 'email' in item ? item.id : item.item;
}

function handleSelectionChanged(newValue: unknown | unknown[]) {
  selectedItem.value = newValue as FieldItem | User | (FieldItem | User)[];

  if (Array.isArray(newValue)) {
    filter.value = {
      ...filter.value,
      value: newValue.map((item) => getItemValue(item)),
    };
  } else {
    filter.value = {
      ...filter.value,
      value: getItemValue(newValue as FieldItem | User),
    };
  }
}

watchEffect(() => {
  if (!filter.value.field) {
    selectedField.value = null;
  }

  if (!filter.value.operator) {
    filteringOption.value = null;
  }

  if (!filter.value.value) {
    selectedItem.value = null;
  }
});

watchEffect(() => {
  if (!selectedField.value && filter.value.field !== '') {
    const field = filterableFields.value.find(
      (f) => f.slug === filter.value.field.split('.').pop()
    );

    selectedField.value = field ?? null;
  }

  if (!filteringOption.value && filter.value.operator) {
    const filteringOptionToUse = mapFilterOperatorToFileringOption();
    const option = filteringOptionMenuItems.value.find(
      (option) => option.value === filteringOptionToUse
    );

    if (option) {
      handleSelectFilteringOption({
        title: option.title,
        value: option.value as string,
      });
    }
  }
});

watchEffect(() => {
  if (filter.value.value && selectedField.value && !selectedItem.value) {
    let newValue: unknown;

    if (isUserItem.value) {
      newValue =
        users.value?.filter((user) => filter.value.value.includes(user.id)) ??
        null;
    } else {
      newValue = selectedField.value.items?.find((item) =>
        filter.value.value.includes(item.item)
      );
    }

    handleSelectionChanged(newValue);
  }
});
</script>

<template>
  <v-chip
    class="ps-0 pe-2"
    variant="tonal"
    density="compact"
    border="thin"
    :style="{
      width: 'fit-content',
    }"
  >
    <template #close>
      <base-icon-btn icon="mdi-close" @click="emit('delete')" />
    </template>
    <context-menu :items="fieldOptions" #="{ showMenu }">
      <v-card
        @click="showMenu()"
        class="px-2 ps-3 d-flex align-center"
        :class="{
          'border-e-thin': !!selectedField,
        }"
        color="transparent"
        link
        rounded="0"
      >
        <v-icon :icon="selectedField?.icon ?? 'mdi-tag'" size="12" start />
        <span class="text-caption text-medium-emphasis">
          {{ selectedField?.name ?? 'Field' }}
        </span>
      </v-card>
    </context-menu>
    <context-menu
      v-if="selectedField"
      :items="filteringOptionMenuItems"
      #="{ showMenu }"
    >
      <v-card
        @click="showMenu()"
        class="px-2 d-flex align-center"
        :class="{
          'border-e-thin': !!filteringOption,
        }"
        color="transparent"
        link
        rounded="0"
      >
        <span class="text-caption text-medium-emphasis">
          {{ filteringOption?.title.toLowerCase() ?? 'operator' }}
        </span>
      </v-card>
    </context-menu>
    <context-menu
      v-if="selectedField && filteringOption && !hideValueInput"
      v-model="selectedItem"
      @update:model-value="handleSelectionChanged"
      :items="valueItems"
      selectable
      multiple
      #="{ showMenu }"
    >
      <v-card
        @click="showMenu()"
        class="px-2 d-flex align-center"
        color="transparent"
        link
        rounded="0"
      >
        <span class="text-caption text-medium-emphasis">
          {{ selectedItemLabel }}
        </span>
      </v-card>
    </context-menu>
  </v-chip>
</template>
