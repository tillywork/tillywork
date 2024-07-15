<script setup lang="ts">
import BaseColorPicker from './BaseColorPicker.vue';

type Item = string | { [key: string]: any };

const props = defineProps<{
  label?: string;
  itemType: 'string' | 'object';
  /** If array of objects, define the key to use as value */
  itemValue?: string;
  itemColor?: boolean;
}>();

const value = defineModel<Item[]>();

const isLastItemEmpty = computed<boolean>(() => {
  if (props.itemType === 'string') {
    return !!value.value && value.value[value.value.length - 1] === '';
  } else if (props.itemType === 'object' && props.itemValue) {
    return !!value.value?.find((v) => {
      if (typeof v === 'object') {
        return v[props.itemValue!] === '';
      }
      return false;
    });
  }
  return false;
});

function addItem() {
  if (!isLastItemEmpty.value) {
    if (props.itemType === 'string') {
      value.value = [...(value.value ?? []), ''];
    } else if (props.itemType === 'object') {
      value.value = [...(value.value ?? []), { [props.itemValue!]: '' }];
    }
  }
}

function removeItem(index: number) {
  if (value.value) {
    value.value = [
      ...value.value.slice(0, index),
      ...value.value.slice(index + 1),
    ];
  }
}

watch(
  value,
  (v) => {
    if (!v || !v.length) {
      // Maintain an empty text field if no items exist
      addItem();
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-card>
    <v-card-title class="text-body-3 d-flex align-center mb-1">
      {{ label }}
      <v-spacer />
      <v-btn
        text="Add item"
        class="text-capitalize"
        variant="text"
        size="small"
        @click="addItem"
      />
    </v-card-title>
    <v-list v-if="value">
      <template v-for="(item, index) in value" :key="index">
        <v-list-item class="pa-0 mb-1">
          <template v-if="props.itemType === 'string'">
            <v-text-field
              v-model="value[index]"
              hide-details
              :placeholder="`Item ${index + 1}`"
            />
          </template>
          <template v-else-if="props.itemType === 'object' && props.itemValue">
            <v-text-field
              v-model="value[index][props.itemValue]"
              hide-details
              :placeholder="`Item ${index + 1}`"
            >
              <template #prepend-inner>
                <base-color-picker
                  v-model="value[index].color"
                  icon
                  v-if="itemColor"
                />
              </template>
            </v-text-field>
          </template>
          <template #append>
            <base-icon-btn
              icon="mdi-close"
              class="ms-2"
              color="error"
              @click="removeItem(index)"
            />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>
