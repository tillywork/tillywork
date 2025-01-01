<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

import getSymbolFromCurrency from 'currency-symbol-map';

const {
  modelValue,
  rounded = 'pill',
  fill = false,
  tooltip,
} = defineProps<{
  modelValue: number | undefined;
  rounded?: string;
  fill?: boolean;
  tooltip?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const { workspace } = storeToRefs(useAuthStore());
const value = ref(formatCurrency(modelValue?.toString() ?? ''));
const debouncedValue = useDebounce(value, 500);
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const inputWidth = ref(fill ? '100%' : '80px');

watch(debouncedValue, (newValue) => {
  emit(
    'update:modelValue',
    newValue ? parseFloat(newValue.replace(/,/g, '')) : undefined
  );
});

watch(
  value,
  () => {
    if (!fill) {
      adjustWidth();
    }
  },
  { immediate: true }
);

function formatCurrency(val: string): string {
  if (!val) return '';
  const [integer, fraction] = val.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction !== undefined
    ? `${formattedInteger}.${fraction}`
    : formattedInteger;
}

function updateValue(event: Event) {
  const input = event.target as HTMLInputElement;
  let numericValue = input.value
    .replace(/[^\d.]/g, '') // Allow only numbers and dots
    .replace(/(\..*)\./g, '$1'); // Prevent multiple dots

  // Restrict to 2 decimal places
  const [integer, fraction] = numericValue.split('.');
  if (fraction?.length > 2) {
    numericValue = `${integer}.${fraction.slice(0, 2)}`;
  }

  // Update value with formatted currency
  value.value = formatCurrency(numericValue);

  if (!fill) adjustWidth();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('update:modelValue', value.value?.replace(/,/g, ''));
    (event.target as HTMLInputElement).blur();
  }
}

function adjustWidth() {
  if (inputRef.value) {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.font = window.getComputedStyle(inputRef.value).font;
    document.body.appendChild(tempSpan);

    const inputValue = inputRef.value.value || inputRef.value.placeholder;
    tempSpan.textContent = inputValue;
    const width = tempSpan.offsetWidth;

    document.body.removeChild(tempSpan);

    inputWidth.value = `${Math.max(30, width + 10)}px`;
  }
}

const cardClasses = computed(() => ({
  'is-focused': isFocused.value,
  'flex-fill': fill,
}));

onMounted(() => {
  if (!fill) {
    adjustWidth();
  }
});
</script>

<template>
  <v-card
    class="base-currency-input d-flex align-center px-3"
    :class="cardClasses"
    color="transparent"
    :rounded
  >
    <v-tooltip activator="parent" location="top" v-if="!fill">
      {{ tooltip }}
    </v-tooltip>
    <span class="text-caption">{{
      getSymbolFromCurrency(workspace?.currency ?? '')
    }}</span>
    <input
      v-model="value"
      ref="inputRef"
      type="text"
      class="text-caption pa-2 pe-0 h-100"
      @input="updateValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeydown"
      :placeholder="value ? '' : '0.00'"
      :style="{ width: inputWidth }"
    />
  </v-card>
</template>

<style lang="scss">
.base-currency-input {
  input {
    border: none;
    outline: none;
  }

  input::placeholder {
    color: #9e9e9e;
  }

  &.is-focused .v-card__overlay {
    opacity: calc(var(--v-hover-opacity) * var(--v-theme-overlay-multiplier));
  }
}
</style>
