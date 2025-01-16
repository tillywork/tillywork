<script setup lang="ts">
import { useCardsService } from '@/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/lib/components/index.mjs';
import { useDialogStore } from '@/stores/dialog';
import { DIALOGS } from '../types';
import BaseListSelector from '../../inputs/BaseListSelector.vue';
import { cloneDeep } from 'lodash';
import { useAuthStore } from '@/stores/auth';
import BaseCardChip from '@/components/project-management/cards/BaseCardChip.vue';
import { leaderKey } from '@/utils/keys';
import BaseField from '../../fields/BaseField.vue';
import {
  type CardType,
  type CreateCardDto,
  type List,
} from '@tillywork/shared';
import { useCard } from '@/composables/useCard';
import { useFieldQueryStore } from '@/stores/field.query';

const dialog = useDialogStore();
const { workspace } = storeToRefs(useAuthStore());
const { showSnackbar } = useSnackbarStore();

const { meta, ctrl, enter } = useMagicKeys();
const { normalizeFieldValue } = useCard();

const createForm = ref<VForm>();
const isCreatingMore = ref(false);

const { useCreateCardMutation } = useCardsService();
const { mutateAsync: createCard, isPending: isCreating } =
  useCreateCardMutation();

const currentDialogIndex = computed(() =>
  dialog.getDialogIndex(DIALOGS.CREATE_CARD)
);
const currentDialog = computed(() => dialog.dialogs[currentDialogIndex.value]);

dialog.updateDialogOptions(currentDialogIndex.value, {
  width: 500,
});

const list = computed(() => currentDialog.value?.data?.list);

const cardType = computed<CardType>(() => {
  if (currentDialog.value?.data && currentDialog.value.data?.type) {
    return currentDialog.value.data.type;
  } else if (list.value) {
    return list.value?.defaultCardType;
  } else {
    return workspace.value?.defaultCardType;
  }
});

const { fields } = storeToRefs(useFieldQueryStore());

const createCardDto = ref<CreateCardDto>({
  listId: currentDialog.value?.data?.listId ?? list.value?.id,
  type: cardType.value?.id,
  workspaceId: workspace.value!.id,
  data: currentDialog.value?.data?.data ?? {},
});

const selectedList = ref<List>(cloneDeep(list.value));
watch(selectedList, (v) => {
  if (v) {
    createCardDto.value.listStage = v.listStages[0];
    createCardDto.value.listId = v.id;
  }
});

function closeDialog() {
  dialog.closeDialog(currentDialogIndex.value);
}

async function handleCreateCard() {
  if (
    createCardDto.value.data.first_name?.trim() ||
    createCardDto.value.data.last_name?.trim() ||
    createCardDto.value.data.email?.trim()
  ) {
    createCard(createCardDto.value)
      .then(() => {
        handlePostCreate();
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

/**
 * Reset title and description fields.
 * If create more is on, don't close the dialog.
 */
function handlePostCreate() {
  createCardDto.value.data = {};

  showSnackbar({
    message: `${cardType.value?.name} created`,
    color: 'success',
    timeout: 2000,
  });

  if (!isCreatingMore.value) {
    closeDialog();
  }
}

watch([meta, ctrl, enter], ([isMetaPressed, isCtrlPressed, isEnterPressed]) => {
  if (isEnterPressed && (isMetaPressed || isCtrlPressed)) {
    handleCreateCard();
  }
});
</script>

<template>
  <v-card color="dialog" elevation="12" border="thin" :loading="isCreating">
    <div class="d-flex align-center ps-0 pa-4">
      <v-card-subtitle class="d-flex align-center">
        <base-list-selector v-model="selectedList" readonly />
        <template v-if="createCardDto.parent">
          <v-icon icon="mdi-arrow-right-thin" class="mx-1" />
          <base-card-chip :card="createCardDto.parent" />
        </template>
        <v-icon icon="mdi-arrow-right-thin" class="mx-1" />
        Create {{ cardType.name }}
      </v-card-subtitle>
      <v-spacer />
      <base-icon-btn icon="mdi-close" color="default" @click="closeDialog()" />
    </div>
    <v-form ref="createForm" @submit.prevent="">
      <div class="pa-4 pt-0 d-flex flex-column ga-4">
        <template v-for="field in fields" :key="field.id">
          <base-field
            :field
            v-model="createCardDto.data[field.slug]"
            flex-fill
            @update:model-value="
              (v) =>
                (createCardDto.data[field.slug] = normalizeFieldValue({
                  v,
                  field,
                }))
            "
            text-field
            type="field"
          />
        </template>
      </div>
      <v-card-actions
        class="d-flex justify-start align-center py-0 px-4 border-t-thin"
      >
        <v-spacer />
        <v-switch v-model="isCreatingMore" hide-details inset>
          <template #label>
            <span class="text-caption">Create more</span>
          </template>
        </v-switch>

        <v-btn
          density="comfortable"
          variant="flat"
          class="text-caption px-4 ms-4"
          @click="handleCreateCard()"
          :loading="isCreating"
        >
          Create {{ cardType.name }}
          <template #append>
            <div class="d-flex align-center ga-1">
              <v-icon
                v-if="leaderKey === 'Cmd'"
                icon="mdi-apple-keyboard-command"
              />
              <span v-else class="text-xs">Ctrl</span>
              <v-icon icon="mdi-keyboard-return" />
            </div>
          </template>
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
