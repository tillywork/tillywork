<script setup lang="ts">
const {
  modelValue,
  rounded = 'pill',
  fill = false,
  label,
  textField,
} = defineProps<{
  modelValue: number | undefined;
  rounded?: string;
  fill?: boolean;
  label?: string;
  textField?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const value = ref(modelValue);
const debouncedValue = useDebounce(value, 300);
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const inputWidth = ref(fill ? '100%' : '50px');

watch(debouncedValue, (newValue) => {
  emit('update:modelValue', newValue);
});

function updateValue(event: Event) {
  const input = event.target as HTMLInputElement;
  const numericValue = input.value.replace(/\D/g, ''); // Remove non-numeric characters
  value.value =
    numericValue === ''
      ? undefined
      : Math.min(Math.max(Number(numericValue), 0), 100);

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

    // Add extra space for the % symbol
    const inputValue =
      (inputRef.value.value || inputRef.value.placeholder) + '%';
    tempSpan.textContent = inputValue;
    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);

    inputWidth.value = `${Math.max(50, Math.min(300, width + 20))}px`; // Min 50px, max 300px
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
      single-line
      hide-details
      :label
      :rounded
      @input="updateValue"
      @click:append-inner="updateValue"
      :min="0"
      :max="100"
    >
      <template #prepend-inner>
        <span class="text-body-3">%</span>
      </template>
    </v-number-input>
  </template>
  <template v-else>
    <v-card
      class="base-percentage-input d-flex align-center px-3 bg-transparent"
      :class="cardClasses"
      :rounded="rounded"
      height="28"
    >
      <v-tooltip activator="parent" location="top" v-if="!fill && label">
        {{ label }}
      </v-tooltip>
      <span>%</span>
      <input
        v-model="value"
        ref="inputRef"
        type="text"
        class="text-caption pa-2 pe-0 h-100"
        :class="{
          'text-center': !fill,
        }"
        @input="updateValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown="handleKeydown"
        :placeholder="value ? '' : label || 'Empty'"
        :style="{ width: inputWidth }"
      />
    </v-card>
  </template>
</template>

<style lang="scss">
.base-percentage-input {
  .input-container {
    position: relative;
    width: 100%;
  }

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
