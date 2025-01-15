<script setup lang="ts">
import type { Card } from '@tillywork/shared';

const { card } = defineProps<{
  card: Card;
}>();
</script>

<template>
  <v-card>
    {{ card }}
  </v-card>
</template>
