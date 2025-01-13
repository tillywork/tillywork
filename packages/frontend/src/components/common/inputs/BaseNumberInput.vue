<script setup lang="ts">
const {
  modelValue,
  rounded = 'pill',
  fill = false,
  label,
  icon,
  textField,
} = defineProps<{
  modelValue: number | undefined;
  rounded?: string;
  fill?: boolean;
  label?: string;
  icon?: string;
  textField?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const value = ref(modelValue);
const debouncedValue = useDebounce(value, 300);
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const inputWidth = ref(fill ? '100%' : '30px'); // Initial width

watch(debouncedValue, (newValue) => {
  emit('update:modelValue', newValue);
});

function updateValue(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = input.value.replace(/\D/g, ''); // Remove non-numeric characters
  value.value = numericValue === '' ? undefined : Number(numericValue);
  if (!fill) {
    adjustWidth();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('update:modelValue', value.value);
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

    const inputValue =
      inputRef.value.value !== ''
        ? inputRef.value.value
        : inputRef.value.placeholder;
    tempSpan.textContent = inputValue;
    const width = tempSpan.offsetWidth;

    document.body.removeChild(tempSpan);

    inputWidth.value = `${Math.max(24, Math.min(300, width + 16))}px`; // Min 24px, max 300px
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
  <template v-if="textField">
    <v-number-input
      v-model="value"
      :prepend-inner-icon="icon"
      single-line
      hide-details
      :label
      :rounded
    />
  </template>
  <template v-else>
    <v-card
      class="base-number-input d-flex align-center ps-2 bg-transparent"
      :class="cardClasses"
      :rounded
      height="28"
    >
      <v-tooltip activator="parent" location="top" v-if="!fill && label">
        {{ label }}
      </v-tooltip>
      <v-icon :icon v-if="icon" size="x-small" start />
      <input
        v-model="value"
        ref="inputRef"
        type="text"
        class="text-caption h-100"
        :class="{
          'text-center': !fill && !icon,
        }"
        @input="updateValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown="handleKeydown"
        :placeholder="label ?? 'Empty'"
        :style="{ width: inputWidth }"
      />
    </v-card>
  </template>
</template>

<style lang="scss">
.base-number-input {
  input {
    border: none;
    outline: none;
  }

  input::placeholder {
    color: #9e9e9e; /* Placeholder color */
  }

  &.is-focused .v-card__overlay {
    opacity: calc(var(--v-hover-opacity) * var(--v-theme-overlay-multiplier));
  }
}
</style>
