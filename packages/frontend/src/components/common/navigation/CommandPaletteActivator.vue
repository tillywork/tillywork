<script setup lang="ts">
import { useCommands } from '@/composables/useCommands';
import { leaderKey } from '@/utils/keyboard';

const { setIsCommandPaletteOpen } = useCommands();
</script>

<template>
  <v-btn
    class="text-none"
    size="small"
    variant="tonal"
    color="default"
    prepend-icon="mdi-help-circle-outline"
    @click="setIsCommandPaletteOpen(true)"
  >
    Commands
    <template #append>
      <div class="d-flex align-center ga-1 ms-3">
        <v-icon v-if="leaderKey === 'Cmd'" icon="mdi-apple-keyboard-command" />
        <span v-else class="text-xs">Ctrl</span>
        <span class="text-xs">K</span>
      </div>
    </template>
  </v-btn>
</template>
