<script setup lang="ts">
import { useInputs, type UseInputsProps } from '@/composables/useInputs';

const props = defineProps<UseInputsProps>();

const emit = defineEmits(['update:modelValue']);

const { selected, search, filteredItems, isItemSelected, toggleItemSelection } =
  useInputs(props, emit);

const attrs = useAttrs();
</script>

<template>
  <template v-if="textField">
    <v-autocomplete
      v-model="selected"
      :items
      item-title="item"
      item-value="item"
      variant="outlined"
      hide-details
      :placeholder
      :prepend-inner-icon="icon"
      :multiple
      autocomplete="off"
      auto-select-first
      :rounded
    />
  </template>
  <template v-else>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-card
          height="28"
          min-width="30"
          v-bind="{
            ...attrs,
            ...props,
          }"
          class="px-2 d-flex align-center flex-wrap text-truncate"
          :class="{
            'flex-fill': fill,
          }"
          color="transparent"
          :rounded="rounded ?? 'pill'"
          @click.prevent
        >
          <v-tooltip activator="parent" location="top" v-if="!fill && label">
            {{ label }}
          </v-tooltip>
          <template v-if="selected && !!selected[0]">
            <v-card-text
              class="pa-0 text-caption"
              :style="{
                width: 'fit-content',
              }"
            >
              {{ selected.join(', ') }}
            </v-card-text>
          </template>
          <template v-else>
            <v-icon :icon v-if="icon" class="me-2" size="x-small" />
            <v-card-subtitle class="text-caption pa-0">{{
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
              <v-list-item-title>{{ item.item }}</v-list-item-title>
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
