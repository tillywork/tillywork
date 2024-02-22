<template>
  <v-navigation-drawer
    v-model="isSidebarOpen"
    location="right"
    temporary
    :width="650"
  >
    <v-form v-model="formValid" @submit.prevent="createProject">
      <v-container class="d-flex flex-column">
        <h2 class="mb-2">Create a new project</h2>
        <v-text-field
          v-model="projectData.name"
          label="Project Name"
          :rules="nameRules"
          required
          color="primary"
          variant="outlined"
        />
        <div>
          <v-btn :disabled="!formValid" type="submit" color="primary"
            >Create</v-btn
          >
        </div>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useHttp } from '@/composables/useHttp';

interface Project {
  name: string
}

export default {
  name: 'CreateProjectSidebar',
  emits: ['create'],
  setup(props, { emit }) {
    const { isSidebarOpen, closeSidebar } = useSidebarState();
    const { data, sendRequest } = useHttp();

    // Form validation rules
    const requiredRule = [(v: string) => !!v || 'This field is required'];

    // Form data initialization
    const projectData = ref<Project>({
      name: '',
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
          emit('create', data.value)
        } catch (error) {
          // Handle error
          console.error('Failed to create project:', error);
        }
      }
    };

    return {
      isSidebarOpen,
      projectData,
      formValid,
      nameRules: requiredRule,
      createProject,
    };
  },
};
</script>
