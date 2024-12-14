<script setup lang="ts">
const model = defineModel<string>();

const hours = ref(12);
const minutes = ref(0);
const period = ref<'AM' | 'PM'>('AM');

const hoursInput = ref<HTMLInputElement | null>(null);
const minutesInput = ref<HTMLInputElement | null>(null);

watch(
  model,
  (newValue) => {
    if (!newValue) {
      hours.value = 12;
      minutes.value = 0;
      period.value = 'AM';
      return;
    }

    const [h, m] = newValue.split(':').map(Number);
    let processedHours = h % 12;
    processedHours = processedHours === 0 ? 12 : processedHours;
    hours.value = processedHours;
    minutes.value = m;
    period.value = h >= 12 ? 'PM' : 'AM';
  },
  { immediate: true }
);

watch([hours, minutes, period], () => {
  let convertedHours = hours.value;
  if (period.value === 'PM' && convertedHours !== 12) {
    convertedHours += 12;
  } else if (period.value === 'AM' && convertedHours === 12) {
    convertedHours = 0;
  }

  const formattedTime = `${convertedHours
    .toString()
    .padStart(2, '0')}:${minutes.value.toString().padStart(2, '0')}`;

  model.value = formattedTime;
});

function handleHoursInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value.length === 2) {
    const numValue = parseInt(value, 10);
    if (numValue > 12) {
      hours.value = numValue % 12 || 12;
      period.value = numValue === 24 || numValue < 12 ? 'AM' : 'PM';
    } else if (numValue >= 1 && numValue <= 12) {
      hours.value = numValue;
    } else {
      input.value = hours.value.toString().padStart(2, '0');
      return;
    }

    minutesInput.value?.focus();
    minutesInput.value?.select();
  }
}

function handleMinutesInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value.length === 2) {
    const numValue = parseInt(value, 10);
    if (numValue >= 0 && numValue <= 59) {
      minutes.value = numValue;
    } else {
      input.value = minutes.value.toString().padStart(2, '0');
    }
  }
}

function changeHours(increment: boolean) {
  hours.value = increment ? (hours.value % 12) + 1 : hours.value - 1 || 12;
}

function changeMinutes(increment: boolean) {
  if (increment) {
    minutes.value = (minutes.value + 1) % 60;
  } else {
    minutes.value = minutes.value === 0 ? 59 : minutes.value - 1;
  }
}

function togglePeriod() {
  period.value = period.value === 'AM' ? 'PM' : 'AM';
}
</script>

<template>
  <div class="time-picker d-flex align-center justify-center pa-4">
    <div class="time-selector d-flex align-center">
      <div class="hours-container d-flex flex-column align-center">
        <v-btn icon variant="text" @click="changeHours(true)" class="mb-2">
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <input
          ref="hoursInput"
          type="text"
          pattern="\d{2}"
          maxlength="2"
          :value="hours.toString().padStart(2, '0')"
          @input="handleHoursInput"
          class="time-input text-center"
          autofocus
        />
        <v-btn icon variant="text" @click="changeHours(false)" class="mt-2">
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      <div class="mx-2 time-separator">:</div>
      <div class="minutes-container d-flex flex-column align-center">
        <v-btn icon variant="text" @click="changeMinutes(true)" class="mb-2">
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <input
          ref="minutesInput"
          type="text"
          pattern="\d{2}"
          maxlength="2"
          :value="minutes.toString().padStart(2, '0')"
          @input="handleMinutesInput"
          class="time-input text-center"
        />
        <v-btn icon variant="text" @click="changeMinutes(false)" class="mt-2">
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      <v-card class="ms-6 d-flex flex-column rounded-md">
        <v-card
          variant="tonal"
          :color="period === 'AM' ? 'primary' : 'default'"
          rounded="0"
          border="none"
          @click="togglePeriod"
        >
          <v-card-title class="text-body-2 font-weight-medium">AM</v-card-title>
        </v-card>
        <v-card
          variant="tonal"
          :color="period === 'PM' ? 'primary' : 'default'"
          rounded="0"
          border="none"
          @click="togglePeriod"
        >
          <v-card-title class="text-body-2 font-weight-medium">PM</v-card-title>
        </v-card>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.time-picker {
  user-select: none;
}

.time-input {
  font-size: 1.5rem;
  width: 2.5rem;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  padding: 0;
}

.time-separator {
  font-size: 1.5rem;
}
</style>
