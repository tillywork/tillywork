<script setup lang="ts">
const {
  modelValue,
  rounded = 'md',
  fill = false,
} = defineProps<{
  modelValue: number | undefined;
  pill?: boolean;
  rounded?: string;
  fill?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const value = ref(modelValue);
const debouncedValue = useDebounce(value, 300);
const isFocused = ref(false);

watch(debouncedValue, (newValue) => {
  emit('update:modelValue', newValue);
});

function updateValue(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = input.value.replace(/\D/g, ''); // Remove non-numeric characters
  value.value = numericValue === '' ? undefined : Number(numericValue);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('update:modelValue', value.value);
    (event.target as HTMLInputElement).blur();
  }
}

const cardClasses = computed(() => ({
  'is-focused': isFocused.value,
  'flex-fill': fill,
}));
</script>

<template>
  <v-card
    class="base-number-input d-flex align-center"
    :class="cardClasses"
    color="transparent"
    :rounded
  >
    <input
      v-model="value"
      type="text"
      class="text-caption pa-2 h-100"
      @input="updateValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeydown"
      :placeholder="value ? '' : 'Empty'"
    />
  </v-card>
</template>

<style lang="scss">
.base-number-input {
  input {
    border: none;
    outline: none;
    width: 100%;
  }

  input::placeholder {
    color: #9e9e9e; /* Placeholder color */
  }

  &.is-focused .v-card__overlay {
    opacity: calc(var(--v-hover-opacity) * var(--v-theme-overlay-multiplier));
  }
}
</style>
