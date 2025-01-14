<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import { useWorkspacesService } from '@/services/useWorkspacesService';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import CreateWorkspaceForm from '@/components/project-management/workspaces/CreateWorkspaceForm.vue';
import { useDialogStore } from '@/stores/dialog';
import { WorkspaceTypes, type Workspace } from '@tillywork/shared';
import { DIALOGS } from './types';
import { useStateStore } from '@/stores/state';
import posthog from 'posthog-js';

const logo = useLogo();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { showSnackbar } = useSnackbarStore();
const dialog = useDialogStore();
const { setSpaceExpansionState, navigateToLastList } = useStateStore();

const workspacesService = useWorkspacesService();
const usersService = useUsersService();

const createWorkspaceMutation = workspacesService.useCreateWorkspaceMutation();
const updateUserMutation = usersService.updateUserMutation();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.ONBOARDING)
);

const onboardingSteps = ref([
  'Get started',
  'Using tillywork',
  'Create workspace',
]);
const currentStep = ref(1);

const modules = [
  WorkspaceTypes.PROJECT_MANAGEMENT,
  WorkspaceTypes.CRM,
  WorkspaceTypes.AGILE_PROJECTS,
];
const selectedModules = ref([]);
const selectedModuleNames = computed(() =>
  selectedModules.value.map((index) => modules[index])
);

function submitStepTwo() {
  posthog.capture('Onboarding', { step: 2, value: selectedModuleNames.value });

  updateUserMutation.mutate({
    ...user.value,
    onboarding: {
      usingFor: selectedModuleNames.value,
    },
  });
  nextStep();
}

function nextStep() {
  currentStep.value++;
}

async function createWorkspace(createWorkspaceDto: Partial<Workspace>) {
  createWorkspaceMutation
    .mutateAsync(createWorkspaceDto)
    .then((workspace) => {
      posthog.capture('Onboarding', { step: 3, value: workspace.type });

      dialog.closeDialog(currentDialogIndex.value);
      switch (workspace.type) {
        case WorkspaceTypes.PROJECT_MANAGEMENT:
          setSpaceExpansionState(workspace.id, [workspace.spaces[0].id]);
          break;
        case WorkspaceTypes.CRM:
        default:
          break;
      }

      navigateToLastList();
    })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    });
}

onMounted(() => {
  posthog.capture('Onboarding', { step: 1 });
});
</script>

<template>
  <v-card class="onboarding-dialog">
    <v-card-text class="pt-0">
      <v-stepper v-model="currentStep" :items="onboardingSteps" hide-actions>
        <template #item.1>
          <v-img
            :src="logo.getLogoUrlByTheme()"
            width="180"
            class="mx-auto mb-12"
          />
          <h3 class="text-center">Let's get you started using tillywork</h3>
          <p class="text-caption text-center">Estimated time: 30 seconds</p>

          <div class="text-center mt-6">
            <v-btn
              variant="flat"
              size="large"
              class="text-body-1"
              @click="nextStep"
              >Start</v-btn
            >
          </div>
        </template>
        <template #item.2>
          <v-img
            :src="logo.getLogoUrlByTheme()"
            width="180"
            class="mx-auto mb-12"
          />
          <h3 class="text-center">What do you want to use tillywork for?</h3>
          <p class="text-caption text-center">Pick all that apply</p>
          <v-container fluid>
            <v-row>
              <v-col class="ga-12 pt-12">
                <v-item-group
                  v-model="selectedModules"
                  multiple
                  class="d-flex justify-center ga-12"
                >
                  <v-item #="{ isSelected, toggle }">
                    <v-card
                      color="accent"
                      class="fill-height text-center py-4 border-thin user-select-none"
                      width="200"
                      @click="toggle"
                      :class="!isSelected ? 'border-accent' : ''"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        color="primary"
                        class="position-absolute"
                        style="top: 5px; right: 5px"
                        v-if="isSelected"
                      />
                      <v-card-title class="pb-0">
                        <v-icon
                          size="40"
                          :icon="
                            isSelected
                              ? 'mdi-timeline-check'
                              : 'mdi-timeline-check-outline'
                          "
                          class="mb-6"
                        />
                        <p class="text-body-1">Project Management</p>
                      </v-card-title>
                      <v-card-text class="text-caption">
                        General business projects
                      </v-card-text>
                    </v-card>
                  </v-item>
                  <v-item #="{ isSelected, toggle }">
                    <v-card
                      color="accent"
                      class="fill-height text-center py-4 border-thin user-select-none"
                      width="200"
                      @click="toggle"
                      :class="!isSelected ? 'border-accent' : ''"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        color="primary"
                        class="position-absolute"
                        style="top: 5px; right: 5px"
                        v-if="isSelected"
                      />
                      <v-card-title class="pb-0">
                        <v-icon
                          size="40"
                          :icon="
                            isSelected
                              ? 'mdi-handshake'
                              : 'mdi-handshake-outline'
                          "
                          class="mb-6"
                        />
                        <p class="text-body-1">Sales CRM</p>
                      </v-card-title>
                      <v-card-text class="text-caption">
                        Marketing and sales work
                      </v-card-text>
                    </v-card>
                  </v-item>
                  <v-item #="{ isSelected, toggle }">
                    <v-card
                      color="accent"
                      class="fill-height text-center py-4 border-thin user-select-none"
                      width="200"
                      @click="toggle"
                      :class="!isSelected ? 'border-accent' : ''"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        color="primary"
                        class="position-absolute"
                        style="top: 5px; right: 5px"
                        v-if="isSelected"
                      />
                      <v-card-title class="pb-0">
                        <v-icon
                          size="40"
                          :icon="
                            isSelected
                              ? 'mdi-application-braces'
                              : 'mdi-application-braces-outline'
                          "
                          class="mb-6"
                        />
                        <p class="text-body-1">Agile Projects</p>
                      </v-card-title>
                      <v-card-text class="text-caption">
                        Product and sprints
                      </v-card-text>
                    </v-card>
                  </v-item>
                </v-item-group>
                <div class="text-center mt-12">
                  <v-btn
                    variant="flat"
                    size="large"
                    class="text-body-1"
                    @click="submitStepTwo"
                    >Next</v-btn
                  >
                </div>
              </v-col>
            </v-row>
          </v-container>
        </template>
        <template #item.3>
          <v-img
            :src="logo.getLogoUrlByTheme()"
            width="180"
            class="mx-auto mb-12"
          />
          <h3 class="text-center">Create a workspace</h3>
          <p class="text-caption text-center">
            Workspaces hold your work for a certain app
          </p>
          <p class="text-caption text-center mb-0">
            (You can create workspaces at any time)
          </p>

          <create-workspace-form
            @submit="createWorkspace"
            :loading="createWorkspaceMutation.isPending.value"
          />
        </template>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<style lang="scss">
.onboarding-dialog .v-stepper-header {
  box-shadow: none;
}
</style>
