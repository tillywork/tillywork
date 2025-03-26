<script setup lang="ts">
const inputValue = defineModel();
const {
  label,
  placeholder,
  autofocus = false,
} = defineProps<{
  label?: string;
  placeholder?: string;
  autofocus?: boolean;
}>();

const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (autofocus && inputRef.value) {
    inputRef.value.focus();
  }
});
</script>

<template>
  <div
    class="tw-text-input rounded-pill"
    :class="[{ 'tw-text-input--focused': isFocused }]"
  >
    <div class="tw-text-input__container">
      <input
        v-model="inputValue"
        ref="inputRef"
        class="tw-text-input__field"
        :placeholder="label ?? placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$tw-input-border: var(--v-border-color);
$tw-border-opacity: calc(var(--v-border-opacity) * 2);
$tw-placeholder-color: var(--v-theme-on-dialog);
$tw-placeholder-opacity: 0.6;
$tw-input-font-size: 0.8125rem;

.tw-text-input {
  border-style: solid;
  border-width: thin;
  border-color: rgba($tw-input-border, $tw-border-opacity);
  padding: 0.2rem 0.6rem;

  & ::placeholder {
    color: rgb($tw-placeholder-color);
    opacity: $tw-placeholder-opacity;
  }

  .tw-text-input__container {
    .tw-text-input__field {
      font-size: $tw-input-font-size;
    }

    .tw-text-input__field:focus {
      outline: none;
    }
  }
}

.tw-text-input--focused {
  border-color: rgba($tw-input-border, calc($tw-border-opacity * 1.5));
}
</style>
