<script setup lang="ts">
import { useCommandStore } from '@/stores/command';
import { useStateStore } from '@/stores/state';

const { currentCard } = storeToRefs(useStateStore());
const { currentField } = storeToRefs(useCommandStore());
</script>

<template>
  <v-card color="transparent"> </v-card>
</template>
