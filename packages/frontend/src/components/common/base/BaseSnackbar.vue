<script setup lang="ts">
const { color, timeout = 4000 } = defineProps<{
  color?: string;
  timeout?: number;
}>();

const emit = defineEmits(['close']);

const snackbarProgress = ref(100);
let interval: NodeJS.Timeout | null = null;

function startCountdown() {
  const step = 100 / (timeout / 100);

  interval = setInterval(() => {
    snackbarProgress.value -= step;
    if (snackbarProgress.value <= 0) {
      stopCountdown();
      closeSnackbar();
    }
  }, 100);
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
    width="fit-content"
    min-width="300"
    max-width="100%"
  >
    <div class="px-4 py-1 d-flex align-center flex-fill">
      <v-icon
        v-if="color === 'success'"
        :icon="'mdi-check-circle'"
        :color
        start
      />
      <v-icon
        v-else-if="color === 'error'"
        :icon="'mdi-close-circle'"
        :color
        start
      />
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
