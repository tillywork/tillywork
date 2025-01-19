<script setup lang="ts">
import { ViewTypes, type List, type View } from '@tillywork/shared';

import { DIALOGS, UpsertDialogMode } from '@/components/common/dialogs/types';

import { useViewsService } from '@/services/useViewsService';

import { useSnackbarStore } from '@/stores/snackbar';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';

const dialog = useDialogStore();
const { list, views } = defineProps<{
  views: View[];
  list: List;
}>();

const confirmDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CONFIRM)
);

const { setListLastView } = useStateStore();
const { listState } = storeToRefs(useStateStore());

const { showSnackbar } = useSnackbarStore();

const { useDeleteViewMutation } = useViewsService();
const { mutateAsync: mutateDeleteView, isPending: isDeletingView } =
  useDeleteViewMutation();

const selectedView = defineModel<View | null>();
const freezeHoverViewId = ref<number>();

function handleTabSelection(view: View) {
  selectedView.value = view;

  if (view) {
    setListLastView({
      listId: list.id,
      viewId: view.id,
    });
  }
}

function getViewIconByType(type: ViewTypes) {
  switch (type) {
    case ViewTypes.TABLE:
      return 'mdi-table';
    case ViewTypes.BOARD:
      return 'mdi-view-column';
    case ViewTypes.LIST:
      return 'mdi-list-box-outline';
    default:
      return 'mdi-view-carousel';
  }
}

function openCreateViewDialog() {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_VIEW,
    data: {
      list,
      mode: UpsertDialogMode.CREATE,
    },
  });
}

function openUpdateViewDialog(view: View) {
  dialog.openDialog({
    dialog: DIALOGS.UPSERT_VIEW,
    data: {
      view,
      mode: UpsertDialogMode.UPDATE,
    },
  });
}

function selectViewFromListStateOrFirstView() {
  let viewToSelect: View | undefined;
  if (listState.value[list.id] && listState.value[list.id].lastViewId) {
    viewToSelect = views.find(
      (v) => v.id === listState.value[list.id].lastViewId
    );
  }

  if (!viewToSelect) {
    viewToSelect = views[0];
  }

  handleTabSelection(viewToSelect);
}

function handleDeleteView(view: View) {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      message: 'Are you sure you want to delete this view?',
      isLoading: isDeletingView,
      onCancel: () => dialog.closeDialog(confirmDialogIndex.value),
      onConfirm: () => deleteView(view),
    },
  });
}

function deleteView(view: View) {
  mutateDeleteView(view.id)
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    })
    .then(() => {
      dialog.closeDialog(confirmDialogIndex.value);

      if (view.id === selectedView.value?.id) {
        selectViewFromListStateOrFirstView();
      }
    });
}

watch(
  () => views,
  () => {
    selectViewFromListStateOrFirstView();
  },
  { immediate: true }
);
</script>

<template>
  <div class="d-flex justify-start align-center">
    <template v-for="view in views" :key="view.id">
      <v-hover #="{ isHovering, props }">
        <v-btn
          :id="'list-view-tab-' + view.id"
          v-bind="props"
          rounded="0"
          variant="text"
          class="text-none text-caption"
          color="default"
          @click="handleTabSelection(view)"
          size="small"
          :class="
            selectedView?.id === view.id ? 'border-b-md border-b-primary' : ''
          "
          :ripple="false"
        >
          <template #prepend>
            <v-icon :icon="getViewIconByType(view.type)" />
          </template>
          {{ view.name }}
          <template
            #append
            v-if="
              selectedView?.id === view.id ||
              isHovering ||
              freezeHoverViewId === view.id
            "
          >
            <v-menu
              @update:model-value="
                (v) => {
                  if (!v) freezeHoverViewId = undefined;
                  else freezeHoverViewId = view.id;
                }
              "
            >
              <template #activator="{ props }">
                <base-icon-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  density="compact"
                  class="ms-2"
                />
              </template>
              <v-card class="border-thin">
                <v-list>
                  <v-list-item @click="openUpdateViewDialog(view)">
                    <template #prepend>
                      <v-icon icon="mdi-playlist-edit" />
                    </template>
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    class="text-error"
                    @click="handleDeleteView(view)"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-delete" />
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-btn>
      </v-hover>
    </template>
    <v-btn
      class="text-none text-caption"
      variant="text"
      size="small"
      rounded="0"
      @click="openCreateViewDialog"
    >
      <template #prepend>
        <v-icon icon="mdi-plus" />
      </template>
      View
    </v-btn>
  </div>
</template>

<style lang="scss" scoped>
.border-b-primary {
  border-block-end-color: rgb(var(--v-theme-primary)) !important;
}
</style>
