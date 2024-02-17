<template>
  <div v-if="projects && showNoProjectMessage" class="d-flex flex-column align-center">
    <v-img :src="noProjectImage" :width="300" aspect-ratio="16/9" class="flex-0-0"></v-img>
    <p class="text-h4 mb-2">We can't find any projects</p>
    <p class="text-h6">Let's create a project and get you started</p>
    <v-btn color="primary" rounded="lg" elevation="0" class="mt-8" @click="openSidebar">Create Project</v-btn>
  </div>
  <CreateProjectSidebar />
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useHttp } from '@/composables/useHttp';
import { ref } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { computed } from 'vue';
import noProjectImage from '@/assets/broken-image.png';
import CreateProjectSidebar from './projects/CreateProjectSidebar.vue';
import { useSidebarState } from '@/composables/useSidebarState';

const { data, error, sendRequest } = useHttp();
const { selectedProjectId, setSelectedProject } = useAuth();
const { openSidebar } = useSidebarState();
const { showSnackbar } = useSnackbar();

const projects = ref<any | null>(null);
const showNoProjectMessage = computed(() => projects.value.length === 0)

const fetchProjects = async () => {
  await sendRequest('/projects')

  if (error.value) {
    throw error.value;
  }

  projects.value = data.value.projects
}

fetchProjects();
</script>
