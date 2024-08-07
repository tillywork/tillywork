<script setup lang="ts">
import type { Field } from '@/components/project-management/fields/types';
import { useCardsService } from '@/services/useCardsService';
import { useAuthStore } from '@/stores/auth';
import BaseCardChip from '@/components/project-management/cards/BaseCardChip.vue';
import { useCardTypeFields } from '@/composables/useCardTypeFields';

const model = defineModel();
const props = defineProps<{
  field: Field;
  multiple?: boolean;
  variant?:
    | 'outlined'
    | 'plain'
    | 'underlined'
    | 'filled'
    | 'solo'
    | 'solo-inverted'
    | 'solo-filled';
}>();

const keyword = ref<string>('');
const debouncedKeyword = useDebounce(keyword, 500);

const { workspace } = storeToRefs(useAuthStore());

const searchEnabled = computed(() => keyword.value.length > 2);

const { useSearchCards } = useCardsService();
const { data: items, refetch } = useSearchCards({
  keyword,
  workspaceId: workspace.value!.id,
  cardTypeId: props.field.dataCardType!.id,
});

const { titleField } = useCardTypeFields({
  cardTypeId: props.field.dataCardType!.id,
});

watch(debouncedKeyword, () => {
  if (searchEnabled.value) {
    refetch();
  }
});
</script>

<template>
  <v-autocomplete
    v-model="model"
    v-model:search="keyword"
    :items="items ?? []"
    no-filter
    item-value="id"
    :item-title="`data.${titleField?.slug}`"
    :variant
    hide-details
    :placeholder="field.name"
    :prepend-inner-icon="field.icon"
    :multiple="multiple ?? field.multiple"
    autocomplete="off"
    chips
    :no-data-text="!searchEnabled ? 'Type to search..' : 'No results'"
    width="160"
  >
    <template #chip="{ item }">
      <base-card-chip :card="{ id: item.value }" disable-link hide-stage />
    </template>
  </v-autocomplete>
</template>
