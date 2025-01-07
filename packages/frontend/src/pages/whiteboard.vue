<script setup lang="ts">
import Excalidraw from '@/components/common/whiteboard/Excalidraw.vue';

definePage({
  meta: {
    requireAuth: true,
  },
});

document.title = 'Whiteboard | tillywork';
</script>

<template>
  <excalidraw />
</template>
