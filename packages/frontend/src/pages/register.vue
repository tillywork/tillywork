<script setup lang="ts">
import RegisterForm from '@/components/common/auth/RegisterForm.vue';

definePage({
  meta: {
    requiresGuest: true,
    hideNavigationDrawer: true,
  },
});

const route = useRoute();

onMounted(() => {
  if (route.query.code) {
    // ~ Redirected from GitHub authorization.
    console.error('todo: generate access token!');
  }
});
</script>

<template>
  <register-form />
</template>
