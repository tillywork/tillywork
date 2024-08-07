<script setup lang="ts">
import { VForm } from 'vuetify/components';
import { WorkspaceTypes, type Workspace } from './types';
import { useAuthStore } from '@/stores/auth';
import validationUtils from '@/utils/validation';

const props = defineProps<{
  loading?: boolean;
  cardClass?: string;
  onboarding?: boolean;
}>();
const emit = defineEmits(['submit']);

const { rules } = validationUtils;
const authStore = useAuthStore();
const { user, project } = storeToRefs(authStore);

const workspaceForm = ref<VForm>();
const workspaceType = ref([WorkspaceTypes.PROJECT_MANAGEMENT]);
const workspaceDto = ref<
  Partial<Workspace> & { createOnboardingData: boolean }
>({
  name: '',
  projectId: project.value!.id,
  ownerId: user.value!.id,
  type: WorkspaceTypes.PROJECT_MANAGEMENT,
  createOnboardingData: props.onboarding,
});

watch(workspaceType, (v) => {
  workspaceDto.value.type = v[0];
});

async function handleSubmit() {
  const isValid = await workspaceForm.value?.validate();
  if (isValid?.valid) {
    emit('submit', workspaceDto.value);
  }
}
</script>

<template>
  <v-form
    ref="workspaceForm"
    @submit.prevent="handleSubmit"
    validate-on="submit"
  >
    <v-card width="350" class="pt-2 mt-6 mx-auto" :class="cardClass">
      <v-text-field
        label="Name"
        hint="The name of your workspace"
        v-model="workspaceDto.name"
        :rules="[rules.required]"
        persistent-hint
        autofocus
      />
      <p class="mt-6 ms-2 text-subtitle-2">Workspace App</p>
      <v-list
        v-model:selected="workspaceType"
        selectable
        lines="one"
        mandatory
        class="user-select-none"
      >
        <v-list-item
          class="text-body-3"
          rounded="md"
          :value="WorkspaceTypes.PROJECT_MANAGEMENT"
        >
          <template #prepend="{ isSelected }">
            <v-icon
              :icon="
                isSelected ? 'mdi-timeline-check' : 'mdi-timeline-check-outline'
              "
            />
          </template>
          Project Management
        </v-list-item>
        <v-list-item
          class="text-body-3"
          rounded="md"
          :value="WorkspaceTypes.CRM"
          disabled
        >
          <template #prepend="{ isSelected }">
            <v-icon
              :icon="isSelected ? 'mdi-handshake' : 'mdi-handshake-outline'"
            />
          </template>
          Sales CRM (coming soon)
        </v-list-item>
        <v-list-item class="text-body-3" rounded="md" disabled>
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

      <v-card-actions class="justify-center mt-2">
        <v-btn
          variant="flat"
          size="large"
          class="text-none"
          type="submit"
          :loading
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-form>
</template>
