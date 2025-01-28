<script setup lang="ts">
import { useCard } from '@/composables/useCard';
import { useInputs } from '@/composables/useInputs';
import { useListKeyboardNavigation } from '@/composables/useListKeyboardNavigation';

import { useCardsService } from '@/services/useCardsService';
import { useUsersService } from '@/services/useUsersService';

import { useCommandStore } from '@/stores/command';
import { useQueryStore } from '@/stores/query';
import { useStateStore } from '@/stores/state';

import { FieldTypes, type Field } from '@tillywork/shared';
import type { PaletteFieldItem } from './types';

import { clone, isEqual } from 'lodash';

const MIN_SEARCH_LENGTH = 2;

const emit = defineEmits(['update:modelValue']);

const { currentCard } = storeToRefs(useStateStore());
const { currentField, search } = storeToRefs(useCommandStore());
const { users } = storeToRefs(useQueryStore());

const { getUserFullName } = useUsersService();

const { useGetCardQuery } = useCardsService();
const { data: card } = useGetCardQuery({
  cardId: computed(() => currentCard.value?.id as number),
  enabled: computed(() => !!currentCard.value),
});

const { activeIndex, containerRef } = useListKeyboardNavigation();
const { updateFieldValue } = useCard();
const { selected, isItemSelected, toggleItemSelection } = useInputs(
  currentField.value as Field,
  emit
);

const isUserItem = computed(() => currentField.value?.type === FieldTypes.USER);

const items = computed<PaletteFieldItem[]>(() => {
  const emptyItem: PaletteFieldItem = {
    id: null,
    label: `No ${currentField.value?.name.toLowerCase()}`,
    value: null,
    icon: isUserItem.value ? 'mdi-account-outline' : 'mdi-close',
    isUser: isUserItem.value,
    onClick: () => clearFieldValue(),
  };

  if (isUserItem.value) {
    const userItems: PaletteFieldItem[] =
      users.value?.map((u) => ({
        id: u.id,
        value: u.id.toString(),
        label: getUserFullName(u),
        photo: u.photo,
        isUser: true,
        onClick: (item) => toggleItemSelection({ item: item.value }),
      })) ?? [];

    return [emptyItem, ...userItems];
  }

  const fieldItems: PaletteFieldItem[] =
    currentField.value?.items?.map((item) => ({
      id: item.item,
      value: item.item,
      label: item.item,
      icon: item.icon,
      color: item.color,
      onClick: (item) => toggleItemSelection({ item: item.value }),
    })) ?? [];

  return [emptyItem, ...fieldItems];
});

const filteredItems = computed<PaletteFieldItem[]>(() => {
  if (search.value.length < MIN_SEARCH_LENGTH) {
    return items.value;
  } else {
    return items.value.filter((item) =>
      item.label.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())
    );
  }
});

function clearFieldValue() {
  selected.value = [];
}

function isPaletteItemSelected(item: PaletteFieldItem) {
  if (item.id) {
    return isItemSelected({ item: item.value });
  }

  return !card.value?.data[currentField.value!.slug];
}

watch(selected, (v) => {
  if (!card.value || !currentField.value) {
    return;
  }

  if (!isEqual(v, card.value?.data[currentField.value.slug])) {
    updateFieldValue({
      card: card.value,
      field: currentField.value,
      v,
    }).then((card) => {
      currentCard.value = card;
    });
  }
});

watch(
  card,
  (v) => {
    if (v) {
      const currentValue = clone(v.data[currentField.value!.slug]);

      if (currentValue && !isEqual(currentValue, selected.value)) {
        selected.value = currentValue;
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-card color="transparent" v-if="currentField">
    <v-list bg-color="transparent" ref="containerRef">
      <template v-for="(item, index) in filteredItems" :key="item.item">
        <v-list-item
          rounded="pill"
          class="mb-1"
          @click="item.onClick(item)"
          :active="activeIndex === index"
          tabindex="-1"
          v-shortcut="index < 10 ? `${index}` : undefined"
        >
          <template #prepend>
            <template v-if="item.id">
              <template v-if="item.isUser">
                <base-avatar
                  :text="item.label"
                  :photo="item.photo"
                  class="me-2"
                  size="20"
                />
              </template>
              <template v-else>
                <v-icon icon="mdi-circle" :color="item.color" size="12" />
              </template>
            </template>
            <template v-else>
              <v-icon :icon="item.icon" :size="item.isUser ? 20 : 12" />
            </template>
          </template>
          <v-list-item-title>
            {{ item.label }}
          </v-list-item-title>
          <template #append>
            <v-icon icon="mdi-check" v-if="isPaletteItemSelected(item)" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
