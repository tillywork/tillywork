<script setup lang="ts">
import LoginPage from '@/components/common/auth/LoginPage.vue';
definePage({
  meta: {
    requiresGuest: true,
    hideNavigationDrawer: true,
  },
});
</script>

<template>
  <login-page />
</template>
