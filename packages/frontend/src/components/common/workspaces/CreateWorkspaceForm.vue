<script setup lang="ts">
import { VForm } from 'vuetify/components';
import { useAuthStore } from '@/stores/auth';
import validationUtils from '@/utils/validation';
import { WorkspaceTypes, type Workspace } from '@tillywork/shared';

const { loading, cardClass, data } = defineProps<{
  loading?: boolean;
  cardClass?: string;
  data?: Partial<Workspace>;
}>();
const emit = defineEmits(['submit']);

const { user, project } = storeToRefs(useAuthStore());

const workspaceForm = ref<VForm>();
const workspaceDto = ref<Partial<Workspace>>({
  name: '',
  projectId: project.value!.id,
  ownerId: user.value!.id,
  type: WorkspaceTypes.PROJECT_MANAGEMENT,
  ...data,
});

const { rules } = validationUtils;

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
    <v-card
      width="350"
      class="pt-2 mt-6 mx-auto"
      :class="cardClass"
      color="transparent"
    >
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
        selectable
        lines="one"
        mandatory
        class="user-select-none"
        bg-color="transparent"
      >
        <v-list-item
          class="text-body-3"
          rounded="md"
          @click="workspaceDto.type = WorkspaceTypes.PROJECT_MANAGEMENT"
          :active="workspaceDto.type === WorkspaceTypes.PROJECT_MANAGEMENT"
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
          @click="workspaceDto.type = WorkspaceTypes.CRM"
          :active="workspaceDto.type === WorkspaceTypes.CRM"
        >
          <template #prepend="{ isSelected }">
            <v-icon
              :icon="isSelected ? 'mdi-handshake' : 'mdi-handshake-outline'"
            />
          </template>
          Sales CRM
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
          Product (coming soon)
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
