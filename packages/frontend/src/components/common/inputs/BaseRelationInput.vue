<script setup lang="ts">
import { useCardsService } from '@/services/useCardsService';
import { useAuthStore } from '@/stores/auth';
import BaseCardChip from '@/components/common/cards/BaseCardChip.vue';
import type { Card, Field } from '@tillywork/shared';
import { useFieldQueryStore } from '@/stores/field.query';

const model = defineModel<string[]>({
  default: [],
});
const props = defineProps<{
  field: Field;
  multiple?: boolean;
  fill?: boolean;
  type?: 'field' | 'dropdown';
  rounded?: string;
}>();

const search = ref<string>('');
const debouncedSearch = useDebounce(search, 500);
const attrs = useAttrs();

const { workspace } = storeToRefs(useAuthStore());

const searchEnabled = computed(() => search.value.length > 2);

const { useSearchCards } = useCardsService();
const { data: items, refetch } = useSearchCards({
  keyword: search,
  workspaceId: workspace.value!.id,
  cardTypeId: props.field.dataCardType!.id,
});

const { titleField } = storeToRefs(useFieldQueryStore());

function isItemSelected(item: Card): boolean {
  return model.value.includes(item.id.toString());
}

function toggleItemSelection(item: Card): void {
  const stringId = item.id.toString();
  let newSelected: string[];
  if (props.multiple) {
    newSelected = isItemSelected(item)
      ? model.value.filter((id) => id !== stringId)
      : [...model.value, stringId];
  } else {
    newSelected = isItemSelected(item) ? [] : [stringId];
  }

  model.value = newSelected;
}

function clearSelection() {
  model.value = [];
}

watch(debouncedSearch, () => {
  if (searchEnabled.value) {
    refetch();
  }
});
</script>

<template>
  <template v-if="type === 'field'">
    <v-autocomplete
      v-model="model"
      v-model:search="search"
      :items="items ?? []"
      no-filter
      item-value="id"
      :item-title="`data.${titleField?.slug}`"
      hide-details
      :placeholder="field.name"
      :prepend-inner-icon="field.icon"
      :multiple="multiple ?? field.multiple"
      autocomplete="off"
      chips
      :no-data-text="!searchEnabled ? 'Type to search..' : 'No results'"
      :rounded
    >
      <template #chip="{ item }">
        <base-card-chip :card="{ id: item.value }" disable-link hide-stage />
      </template>
    </v-autocomplete>
  </template>
  <template v-else>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-card
          v-bind="{
            ...attrs,
            ...props,
          }"
          color="transparent"
          class="d-flex align-center px-1"
          :class="{
            'flex-fill': fill,
          }"
          :rounded
          @click.prevent
        >
          <template v-if="model && model.length">
            <div class="d-flex align-center flex-wrap ga-1 me-1">
              <template v-for="cardId in model" :key="cardId">
                <base-card-chip
                  :card="{ id: +cardId }"
                  disable-link
                  hide-stage
                />
              </template>
            </div>
            <base-icon-btn
              icon="mdi-close"
              @click="clearSelection()"
              density="comfortable"
            />
          </template>
          <template v-else>
            <v-chip density="comfortable" class="text-caption">
              {{ field.name }}
            </v-chip>
          </template>
        </v-card>
      </template>
      <v-card v-if="titleField">
        <v-text-field
          v-model="search"
          placeholder="Search.."
          autofocus
          hide-details
          clearable
          autocomplete="off"
          variant="filled"
          rounded="0"
        />
        <v-list>
          <template v-if="!items || !items.length">
            <v-list-item>
              <v-list-item-title>Type to search..</v-list-item-title>
            </v-list-item>
          </template>
          <template v-for="item in items" :key="item.item">
            <v-list-item
              :active="isItemSelected(item)"
              @click="toggleItemSelection(item)"
            >
              <v-list-item-title>{{
                item.data[titleField.slug]
              }}</v-list-item-title>
              <template #append>
                <v-icon
                  icon="mdi-check"
                  size="12"
                  v-if="isItemSelected(item)"
                />
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>
  </template>
</template>
