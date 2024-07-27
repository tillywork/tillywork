<script setup lang="ts">
import type { MaybeRef } from 'vue';
import { VTextField } from 'vuetify/components';
import stringUtils from '@/utils/string';

const slug = defineModel();
const auto = defineModel<boolean>('auto');

const props = defineProps<{
  props: Omit<VTextField['$props'], 'modelValue'>;
  dependent?: MaybeRef<string>;
}>();

watch(
  () => props.dependent,
  (v) => {
    if (auto.value) {
      if (v) {
        slug.value = stringUtils.slugify(toValue(v));
      } else {
        slug.value = '';
      }
    }
  }
);
</script>

<template>
  <v-text-field
    v-model="slug"
    v-bind="props.props"
    @update:model-value="auto = false"
  />
</template>
