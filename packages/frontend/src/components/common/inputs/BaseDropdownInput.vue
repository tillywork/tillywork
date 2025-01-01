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
    />
  </template>
  <template v-else>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-card
          color="transparent"
          v-bind="{
            ...attrs,
            ...props,
          }"
          class="pa-2 d-flex align-center text-truncate"
          :class="{
            'flex-fill': fill,
          }"
          :rounded="rounded ?? 'pill'"
          @click.prevent
        >
          <v-icon v-if="icon" :icon start />
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
