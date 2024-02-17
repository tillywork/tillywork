<template>
  {{ projectDetails }}
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useHttp } from '@/composables/useHttp';
import { onMounted, ref } from 'vue';

const route = useRoute();
const router = useRouter();
const { data, error, sendRequest } = useHttp();
const projectDetails = ref<null | any>(null)

onMounted(async () => {
  await sendRequest(`/projects/${route.params.projectId}`, {
    method: 'GET',
  })

  if (error.value) {
    router.push({ name: 'Projects' })
  }

  projectDetails.value = data.value;
})
</script>