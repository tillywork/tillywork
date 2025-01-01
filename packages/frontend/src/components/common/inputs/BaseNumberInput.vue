<script setup lang="ts">
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

    const inputValue = inputRef.value.value || inputRef.value.placeholder;
    tempSpan.textContent = inputValue;
    const width = tempSpan.offsetWidth;

    document.body.removeChild(tempSpan);

    inputWidth.value = `${Math.max(30, Math.min(300, width + 20))}px`; // Min 50px, max 300px
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
    class="base-number-input d-flex align-center"
    :class="cardClasses"
    color="transparent"
    :rounded
  >
    <v-tooltip activator="parent" location="top" v-if="!fill">
      {{ tooltip }}
    </v-tooltip>
    <input
      v-model="value"
      ref="inputRef"
      type="text"
      class="text-caption pa-2 h-100"
      :class="{
        'text-center': !fill,
      }"
      @input="updateValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="handleKeydown"
      :placeholder="value ? '' : 'Empty'"
      :style="{ width: inputWidth }"
    />
  </v-card>
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
