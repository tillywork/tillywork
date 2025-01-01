<script setup lang="ts">
definePage({
  meta: {
    requiresAuth: true,
  },
});

const router = useRouter();

router.push('/');
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12"> 404 </v-col>
    </v-row>
  </v-container>
</template>
