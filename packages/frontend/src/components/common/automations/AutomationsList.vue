<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useQueryStore } from '@/stores/query';
import { useSnackbarStore } from '@/stores/snackbar';

import { useAutomationService } from '@/services/useAutomationService';

import LocationSelector, {
  type LocationSelection,
} from '@/components/common/inputs/LocationSelector.vue';
import BaseTable from '../tables/BaseTable/BaseTable.vue';
import MenuWrapper from '../base/ContextMenu/MenuWrapper.vue';

import {
  AutomationStepType,
  type Automation,
  type CreateAutomationLocationDto,
} from '@tillywork/shared';
import type { ColumnDef } from '@tanstack/vue-table';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../dialogs/types';
import { useStateStore } from '@/stores/state';

const { initialListId } = defineProps<{
  initialListId?: number;
}>();

const router = useRouter();

const location = ref<LocationSelection | null>(null);

const tableColumns: ColumnDef<Automation>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    size: 300,
  },
  {
    id: 'locations',
    header: 'Locations',
    accessorKey: 'locations',
    accessorFn: (row) => row.locations.map((l) => l.location.name).join(', '),
  },
  {
    id: 'createdAt',
    header: 'Created On',
    accessorKey: 'createdAt',
    accessorFn: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    id: 'isEnabled',
    header: 'Status',
    accessorKey: 'isEnabled',
  },
];

const { setTitle } = useStateStore();
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();
const { lists } = storeToRefs(useQueryStore());
const { workspace } = storeToRefs(useAuthStore());

const {
  useGetAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useDuplicateAutomation,
} = useAutomationService();

const isCreateDisabled = computed(() => !location.value);
const listId = computed(() =>
  location.value?.locationType === 'list'
    ? location.value.locationId
    : undefined
);
const spaceId = computed(() =>
  location.value?.locationType === 'space'
    ? location.value.locationId
    : undefined
);

const { data: automations } = useGetAutomations({
  workspaceId: workspace.value!.id,
  listId,
  spaceId,
});

const { mutateAsync: createAutomation, isPending: isCreating } =
  useCreateAutomation();

async function handleCreateAutomation() {
  if (isCreateDisabled.value) {
    showSnackbar({
      message: 'Select a location to create an automation',
      color: 'error',
    });
    return;
  }

  const automation = await createAutomation({
    name: 'Untitled',
    workspaceId: workspace.value!.id,
    locations: location.value
      ? [
          {
            locationId: location.value.locationId,
            locationType: location.value.locationType,
          } as CreateAutomationLocationDto,
        ]
      : undefined,
    trigger: {
      data: {},
      type: AutomationStepType.TRIGGER,
    },
  });

  handleSelectAutomation(automation);
}

function handleSelectAutomation(automation: Automation) {
  router.push(`/automations/${automation.id}`);
}

function setLocationFromInitialListId() {
  if (initialListId) {
    const selectedList = lists.value?.find((list) => list.id === initialListId);

    if (selectedList) {
      location.value = {
        locationType: 'list',
        locationId: initialListId,
        location: selectedList,
      };
    }
  }
}

const { mutateAsync: deleteAutomation } = useDeleteAutomation();

function handleDeleteAutomation(automationId: string) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Delete Automation',
      message: 'Are you sure you want to delete this automation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteAutomation(automationId).catch(() => {
          showSnackbar({
            message: 'Something went wrong, please try again.',
            color: 'error',
          });
        });
      },
    },
  });
}

const { mutateAsync: duplicateAutomation } = useDuplicateAutomation();

async function handleDuplicateAutomation(automation: Automation) {
  const duplicatedAutomation = await duplicateAutomation(automation.id).catch(
    () => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    }
  );

  handleSelectAutomation(duplicatedAutomation);
}

onMounted(() => {
  setLocationFromInitialListId();
});

watchEffect(() => {
  if (lists.value) {
    setLocationFromInitialListId();
  }

  setTitle('Automations');
});
</script>

<template>
  <v-container class="bg-surface h-100" fluid>
    <v-app-bar
      class="d-flex align-center border-b-thin px-4"
      color="surface"
      height="60"
    >
      <h4>Automations</h4>
    </v-app-bar>

    <div class="mb-4 d-flex align-center">
      <location-selector v-model="location" clearable />

      <v-spacer />
      <v-btn
        class="text-none text-body-3"
        rounded="pill"
        prepend-icon="mdi-plus"
        :loading="isCreating"
        @click="handleCreateAutomation"
        >Automate</v-btn
      >
    </div>

    <base-table
      :data="automations ?? []"
      :columns="tableColumns"
      @click:row="handleSelectAutomation"
    >
      <template #name="{ row }">
        <div class="d-flex align-center ga-2">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                density="compact"
                color="default"
                @click.stop
              >
                <v-icon icon="mdi-dots-vertical" size="small" />
              </v-btn>
            </template>
            <template #default="{ isActive }">
              <menu-wrapper
                :items="[
                  {
                    title: 'Duplicate',
                    icon: 'mdi-content-duplicate',
                    action: () => handleDuplicateAutomation(row.original),
                  },
                  {
                    title: 'Delete',
                    icon: 'mdi-delete-outline',
                    action: () => handleDeleteAutomation(row.original.id),
                  },
                ]"
                :open="isActive.value"
              />
            </template>
          </v-menu>
          <span>{{ row.original.name }}</span>
        </div>
      </template>
      <template #isEnabled="{ row }">
        <v-switch
          :model-value="row.original.isEnabled"
          inset
          hide-details
          readonly
          density="compact"
        />
      </template>
      <template #empty>
        <div class="text-center d-flex flex-column my-4 ga-2">
          <h3 class="mb-4">Let's get started!</h3>
          <span class="text-body-2"
            >Create an automation to supercharge your workflows.</span
          >
          <span class="text-body-2 text-color-subtitle"
            >Automations allow you to automate actions in your workspace based
            on certain triggers.</span
          >
          <div class="text-center mt-2">
            <v-btn
              class="text-none text-body-3"
              rounded="pill"
              prepend-icon="mdi-plus"
              :loading="isCreating"
              @click="handleCreateAutomation"
              >Automate</v-btn
            >
          </div>
        </div>
      </template>
    </base-table>
  </v-container>
</template>
