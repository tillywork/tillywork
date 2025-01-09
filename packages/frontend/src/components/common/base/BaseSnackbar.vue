<script setup lang="ts">
// Props
const { color, timeout = 4000 } = defineProps<{
  color?: string;
  timeout?: number;
}>();

// Emits
const emit = defineEmits(['close']);

const snackbarProgress = ref(100);
let interval: NodeJS.Timeout | null = null;

function startCountdown() {
  const step = 100 / (timeout / 100); // Calculate the decrement step per interval (100ms)

  interval = setInterval(() => {
    snackbarProgress.value -= step;
    if (snackbarProgress.value <= 0) {
      stopCountdown();
      closeSnackbar();
    }
  }, 100); // Update progress every 100ms
}

function stopCountdown() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function closeSnackbar() {
  emit('close');
}

onMounted(() => {
  startCountdown();
});

// Cleanup on unmount
onUnmounted(() => {
  stopCountdown();
});
</script>

<template>
  <v-card
    :class="['tw-snackbar position-fixed d-flex align-center mb-2']"
    color="surface-variant"
    rounded="pill"
    min-height="44"
  >
    <div class="px-4 py-1 d-flex align-center flex-fill">
      <slot />
      <v-spacer />
      <slot name="actions" />
    </div>
    <v-progress-linear
      v-model="snackbarProgress"
      v-if="timeout !== -1"
      class="position-absolute"
      :color="color ?? 'primary'"
      location="bottom"
    />
  </v-card>
</template>

<style lang="scss">
.tw-snackbar {
  width: 300px;
  left: 50%;
  z-index: 2000;
  animation: fade-in-out 0.3s ease-in-out;

  padding: 14px 16px;
  line-height: 1.425;
  font-size: 0.875rem;
  font-weight: 400;
}

@keyframes fade-in-out {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
