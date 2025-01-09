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
      :rounded
    >
      <template #chip="{ item, props }">
        <v-chip
          v-bind="props"
          :color="item.raw.color"
          variant="tonal"
          rounded="pill"
          class="text-body-3"
        />
      </template>
    </v-autocomplete>
  </template>
  <template v-else>
    <v-menu :close-on-content-click="false" @update:model-value="search = ''">
      <template #activator="{ props }">
        <v-card
          link
          min-height="28"
          v-bind="{
            ...attrs,
            ...props,
          }"
          class="px-2 d-flex align-center text-truncate"
          :class="{
            'flex-fill': fill,
          }"
          color="transparent"
          :rounded
          @click.prevent
        >
          <v-tooltip activator="parent" location="top" v-if="!fill && label">
            {{ label }}
          </v-tooltip>
          <template v-if="selectedItems.length">
            <div class="d-flex align-center flex-wrap text-truncate ga-1">
              <template v-for="item in selectedItems" :key="item.item">
                <v-chip
                  :color="item?.color"
                  variant="tonal"
                  link
                  rounded="pill"
                  class="text-body-3"
                  :density
                >
                  {{ item?.item }}
                </v-chip>
              </template>
            </div>
          </template>
          <template v-else>
            <v-icon :icon v-if="icon" class="me-2" size="x-small" />
            <v-card-subtitle class="pa-0 text-caption">{{
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
          rounded="0"
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
                rounded="pill"
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
