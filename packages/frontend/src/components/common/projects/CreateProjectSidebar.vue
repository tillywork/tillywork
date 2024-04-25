<script setup lang="ts">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useHttp } from '@/composables/useHttp';
import { ProjectTypes, type Project } from './types';

const { isSidebarOpen, closeSidebar } = useSidebarState();
const { data, sendRequest } = useHttp();

const emit = defineEmits(['create']);

// Form validation rules
const requiredRule = [(v: string) => !!v || 'This field is required'];

// Form data initialization
const projectData = ref<Partial<Project>>({
  name: '',
  projectType: ProjectTypes.CRM,
});

const formValid = ref(false);

// Function to create a new project
const createProject = async () => {
  if (formValid.value) {
    try {
      await sendRequest('/projects', {
        method: 'POST',
        data: projectData.value,
      });
      closeSidebar();
      emit('create', data.value);
    } catch (error) {
      // Handle error
      console.error('Failed to create project:', error);
    }
  }
};
</script>

<template>
  <v-navigation-drawer
    v-model="isSidebarOpen"
    location="right"
    temporary
    :width="450"
  >
    <v-form v-model="formValid" @submit.prevent="createProject">
      <div class="d-flex flex-column pa-5">
        <h2 class="mb-6">Create a new project</h2>
        <v-text-field
          v-model="projectData.name"
          label="Project Name"
          :rules="requiredRule"
          required
          class="mb-2"
        />
        <v-select
          v-model="projectData.projectType"
          label="Project Type"
          :items="Object.values(ProjectTypes)"
          density="compact"
        >
        </v-select>
        <div>
          <v-btn :disabled="!formValid" type="submit" color="primary"
            >Create</v-btn
          >
        </div>
      </div>
    </v-form>
  </v-navigation-drawer>
</template>
