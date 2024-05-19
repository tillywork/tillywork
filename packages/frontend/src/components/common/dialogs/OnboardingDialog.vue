<script setup lang="ts">
import { WorkspaceTypes } from '@/components/project-management/workspaces/types';
import { useUsersService } from '@/composables/services/useUsersService';
import { useWorkspacesService } from '@/composables/services/useWorkspacesService';
import { useDialog } from '@/composables/useDialog';
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import { useWorkspaceStore } from '@/stores/workspace';
import validationUtils from '@/utils/validation';
import { VForm } from 'vuetify/components';

const logo = useLogo();
const authStore = useAuthStore();
const { user, project } = storeToRefs(authStore);
const workspaceStore = useWorkspaceStore();
const { showSnackbar } = useSnackbarStore();
const { rules } = validationUtils;
const workspacesService = useWorkspacesService();
const usersService = useUsersService();
const createWorkspaceMutation = workspacesService.useCreateWorkspaceMutation();
const updateUserMutation = usersService.updateUserMutation();
const workspaceForm = ref<VForm>();
const dialog = useDialog();
const router = useRouter();

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

const createWorkspaceType = ref([WorkspaceTypes.PROJECT_MANAGEMENT]);
const createWorkspaceDto = ref({
  name: '',
  ownerId: user.value?.id,
  projectId: project.value?.id,
  type: WorkspaceTypes.PROJECT_MANAGEMENT,
  createOnboardingData: true,
});

watch(createWorkspaceType, (v) => {
  createWorkspaceDto.value.type = v[0];
});

function submitStepTwo() {
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

async function createWorkspace() {
  const isValid = await workspaceForm.value?.validate();
  if (isValid?.valid) {
    createWorkspaceMutation
      .mutateAsync(createWorkspaceDto.value)
      .then((workspace) => {
        workspaceStore.setSelectedWorkspace(workspace);
        dialog.closeDialog();
        workspaceStore.setSpaceExpansionState(workspace.id, [
          workspace.spaces[0].id,
        ]);
        router.push(`/pm/list/${workspace.spaces[0].lists[0].id}`);
      })
      .catch(() => {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
          timeout: 5000,
        });
      });
  }
}
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

          <v-form
            ref="workspaceForm"
            @submit.prevent="createWorkspace"
            validate-on="submit"
          >
            <v-card width="350" class="mt-6 mx-auto">
              <v-text-field
                label="Name"
                hint="The name of your workspace"
                v-model="createWorkspaceDto.name"
                :rules="[rules.required]"
                persistent-hint
                autofocus
              />
              <p class="mt-6 ms-2 text-subtitle-2">Workspace App</p>
              <v-list
                v-model:selected="createWorkspaceType"
                selectable
                lines="one"
                mandatory
                class="user-select-none"
              >
                <v-list-item
                  class="text-body-2"
                  rounded="md"
                  :value="WorkspaceTypes.PROJECT_MANAGEMENT"
                >
                  <template #prepend="{ isSelected }">
                    <v-icon
                      :icon="
                        isSelected
                          ? 'mdi-timeline-check'
                          : 'mdi-timeline-check-outline'
                      "
                    />
                  </template>
                  Project Management
                </v-list-item>
                <v-list-item
                  class="text-body-2"
                  rounded="md"
                  :value="WorkspaceTypes.CRM"
                  disabled
                >
                  <template #prepend="{ isSelected }">
                    <v-icon
                      :icon="
                        isSelected ? 'mdi-handshake' : 'mdi-handshake-outline'
                      "
                    />
                  </template>
                  Sales CRM (coming soon)
                </v-list-item>
                <v-list-item class="text-body-2" rounded="md" disabled>
                  <template #prepend="{ isSelected }">
                    <v-icon
                      :icon="
                        isSelected
                          ? 'mdi-application-braces'
                          : 'mdi-application-braces-outline'
                      "
                    />
                  </template>
                  Agile Projects (coming soon)
                </v-list-item>
              </v-list>
            </v-card>

            <div class="text-center mt-6">
              <v-btn
                variant="flat"
                size="large"
                class="text-body-1"
                type="submit"
                :loading="createWorkspaceMutation.isPending.value"
                >Create</v-btn
              >
            </div>
          </v-form>
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
