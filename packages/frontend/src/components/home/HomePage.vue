<template>
  <div>
    <div
      v-if="projects && showNoProjectMessage"
      class="d-flex flex-column align-center"
    >
      <v-img
        :src="noProjectImage"
        :width="300"
        aspect-ratio="16/9"
        class="flex-0-0"
      ></v-img>
      <p class="text-h4 mb-2">We can't find any projects</p>
      <p class="text-h6">Let's create a project and get you started</p>
      <v-btn
        color="primary"
        rounded="lg"
        elevation="0"
        class="mt-8"
        @click="openSidebar"
        >Create Project</v-btn
      >
    </div>
    <div v-else>
      <p v-for="project in projects" :key="project.id">
        {{ project }}
        <v-btn
          @click="navigateToProject(project.id)"
          >{{ project.name }}</v-btn
        >
      </p>
    </div>
    <CreateProjectSidebar @create="fetchProjects" />
  </div>
</template>

<script lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useHttp } from '@/composables/useHttp';
import { onMounted, ref } from 'vue';
import { computed } from 'vue';
import noProjectImage from '@/assets/broken-image.png';
import { useSidebarState } from '@/composables/useSidebarState';
import CreateProjectSidebar from '../projects/CreateProjectSidebar.vue';
import { useRouter } from 'vue-router';

export default {
  name: 'HomePage',
  components: { CreateProjectSidebar },
  setup() {
    const { data, error, sendRequest } = useHttp();
    const { selectedProjectId, setSelectedProject } = useAuth();
    const { openSidebar } = useSidebarState();
    const router = useRouter();

    const projects = ref<any | null>(null);
    const showNoProjectMessage = computed(() => projects.value.length === 0);

    const fetchProjects = async () => {
      await sendRequest('/projects');

      if (error.value) {
        throw error.value;
      }

      projects.value = data.value.projects;
    };

    function navigateToProject(projectId: number) {
      setSelectedProject(projectId);

      const pathDetails = router.resolve({
        name: 'ProjectHome',
        params: {
          projectId,
        },
      });
      window.location.href = pathDetails.fullPath;
    }

    onMounted(() => {
      fetchProjects();
      
      if (selectedProjectId) {
        router.push({
          name: 'ProjectHome',
          params: {
            projectId: selectedProjectId,
          },
        });
      }
    });

    return {
      projects,
      showNoProjectMessage,
      noProjectImage,
      openSidebar,
      fetchProjects,
      navigateToProject,
    }
  },
};
</script>
