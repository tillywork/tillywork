<template>
  <v-container>
    <v-btn color="primary" class="mb-4" @click="openSidebar"
      >Create Project</v-btn
    >
    <v-data-table
      :items="projects"
      :server-items-length="total"
      v-model:options="options"
      :loading="loading"
      class="elevation-1"
    />
  </v-container>
  <CreateProjectSidebar @create="fetchProjects" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useHttp } from '@/composables/useHttp';
import { useSidebarState } from '@/composables/useSidebarState';
import CreateProjectSidebar from './CreateProjectSidebar.vue';
import type { Project } from './types';

export interface PaginationData {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
}

export interface ProjectsData {
  projects: Project[];
  total: number;
}

const { openSidebar } = useSidebarState();
const { data, loading, sendRequest } = useHttp();

const total = computed(
  () => (data.value as unknown as ProjectsData)?.total ?? 0
);
const projects = computed(
  () => (data.value as unknown as ProjectsData)?.projects ?? []
);

const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [],
  sortDesc: false,
});

const fetchProjects = () => {
  const params: PaginationData = {
    sortBy: options.value.sortBy[0] || '',
    descending: options.value.sortDesc || false,
    page: options.value.page || 1,
    rowsPerPage: options.value.itemsPerPage || 5,
  };

  sendRequest('/projects', {
    method: 'GET',
  });
};

watch(options, fetchProjects, { deep: true });
fetchProjects();
</script>
