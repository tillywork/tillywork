<script setup lang="ts">
import RegisterForm from '@/components/common/auth/RegisterForm.vue';

definePage({
  meta: {
    requiresGuest: true,
    hideNavigationDrawer: true,
  },
});
</script>

<template>
  <register-form />
</template>
