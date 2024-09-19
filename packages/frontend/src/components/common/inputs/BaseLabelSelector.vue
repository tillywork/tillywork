<script setup lang="ts">
import { useInputs, type UseInputsProps } from '@/composables/useInputs';

const props = defineProps<UseInputsProps>();

const emit = defineEmits(['update:modelValue']);

const {
  selected,
  selectedItems,
  search,
  filteredItems,
  isItemSelected,
  toggleItemSelection,
} = useInputs(props, emit);

const attrs = useAttrs();
</script>

<template>
  <template v-if="textField">
    <v-autocomplete
      v-model="selected"
      :items
      item-title="item"
      item-value="item"
      :variant
      hide-details
      :placeholder
      :multiple
      :prepend-inner-icon="icon"
      autocomplete="off"
      chips
      auto-select-first
    >
      <template #chip="{ item, props }">
        <v-chip
          v-bind="props"
          :color="item.raw.color"
          variant="tonal"
          rounded="xl"
          class="text-body-3"
          :density
        />
      </template>
    </v-autocomplete>
  </template>
  <template v-else>
    <v-menu :close-on-content-click="false" @update:model-value="search = ''">
      <template #activator="{ props }">
        <v-card
          link
          v-bind="{
            ...attrs,
            ...props,
          }"
          class="d-flex align-center h-100 ga-1 pa-1"
          :class="{
            'flex-fill': fill,
          }"
          color="transparent"
          :rounded
          @click.prevent
        >
          <template v-if="selectedItems.length">
            <template v-for="item in selectedItems" :key="item.item">
              <v-chip
                :color="item?.color"
                variant="tonal"
                link
                rounded="xl"
                class="text-body-3"
                :density
              >
                {{ item?.item }}
              </v-chip>
            </template>
          </template>
          <template v-else>
            <v-card-subtitle class="pa-1 text-caption">{{
              label
            }}</v-card-subtitle>
          </template>
        </v-card>
      </template>
      <v-card>
        <v-text-field
          v-model="search"
          placeholder="Search.."
          autofocus
          hide-details
          clearable
          autocomplete="off"
          variant="filled"
        />
        <v-list>
          <template v-for="item in filteredItems" :key="item.item">
            <v-list-item
              :active="isItemSelected(item)"
              @click="toggleItemSelection(item)"
            >
              <v-chip
                :color="item.color"
                variant="tonal"
                rounded="xl"
                class="text-body-3"
                :density
              >
                {{ item.item }}
              </v-chip>
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
