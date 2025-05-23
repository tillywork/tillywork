<script setup lang="ts">
import { cloneDeep } from 'lodash';

import { useStateStore } from '@/stores/state';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import { useFieldQueryStore } from '@/stores/field.query';
import { useQueryStore } from '@/stores/query';

import { useCardsService } from '@/services/useCardsService';

import { useCard } from '@/composables/useCard';

import { type Content } from '@tiptap/vue-3';
import {
  CardTypeLayout,
  WorkspaceTypes,
  type Card,
  type ListStage,
} from '@tillywork/shared';

import BaseField from '@/components/common/fields/BaseField.vue';
import ActivityInput from '@/components/common/inputs/CrmActivityInput/ActivityInput.vue';
import ActivityTimeline from '../BaseCardActivityTimeline/ActivityTimeline.vue';
import BaseCardToolbar from './BaseCardToolbar.vue';
import BaseEditorInput from '@/components/common/inputs/BaseEditor/BaseEditorInput.vue';

const { card } = defineProps<{
  card: Card;
}>();

const { workspace } = storeToRefs(useAuthStore());
const { setTitle } = useStateStore();
const { showSnackbar } = useSnackbarStore();
const { listStages, list } = storeToRefs(useQueryStore());

const cardCopy = ref(cloneDeep(card));
const descriptionInput = ref();
const cardDescription = ref<Content>();

const { updateFieldValue, getCardTitle } = useCard();

const { useUpdateCardListMutation } = useCardsService();
const { mutateAsync: updateCardStage } = useUpdateCardListMutation();

const { fields, photoField, descriptionField, titleField } = storeToRefs(
  useFieldQueryStore()
);

const entityName = computed(() => getCardTitle(card, titleField));

function setPageTitle() {
  const title = entityName.value;
  setTitle(title);
}

function handleUpdateCardStage(stage: ListStage) {
  updateCardStage({
    cardId: cardCopy.value.id,
    cardListId: cardCopy.value.cardLists[0].id,
    updateCardListDto: {
      listStageId: stage.id,
    },
  }).catch(() =>
    showSnackbar({
      message: `Something went wrong while updating ${cardCopy.value.type.name} stage.`,
      color: 'error',
    })
  );
}

function initDescription() {
  if (descriptionField.value) {
    cardDescription.value = cardCopy.value.data[descriptionField.value.slug];
  }
}

function openDescriptionFileDialog() {
  descriptionInput.value.openFileDialog();
}

watch(
  () => card,
  (v) => {
    if (v) {
      cardCopy.value = cloneDeep(v);
      setPageTitle();
      initDescription();
    }
  },
  { immediate: true }
);

watch(entityName, () => setPageTitle());

watch(
  () => cardCopy.value.cardLists[0].listStage,
  (v) => {
    if (v.id !== card.cardLists[0].listStage?.id) {
      handleUpdateCardStage(v);
    }
  }
);
</script>

<template>
  <template v-if="cardCopy">
    <base-card-toolbar
      v-if="list"
      v-model="cardCopy"
      :list
      :list-stages="listStages"
    />
    <v-card
      class="d-flex flex-sm-row flex-column"
      min-height="calc(100vh - 49px)"
      max-height="calc(100vh - 49px)"
    >
      <v-card
        width="350"
        min-width="350"
        color="surface"
        :key="cardCopy.id"
        class="border-e-thin"
        rounded="0"
      >
        <div class="pa-4 d-flex align-center">
          <base-avatar
            :photo="photoField ? cardCopy.data[photoField.slug] : undefined"
            :text="entityName"
            size="64"
            class="text-body-2 me-4"
          />
          <div>
            <p class="text-body-1">
              {{ entityName }}
            </p>
            <p class="text-caption">
              <template
                v-if="
                  cardCopy.type.layout === CardTypeLayout.PERSON &&
                  cardCopy.data.email
                "
              >
                {{ cardCopy.data.email }}
              </template>
              <template
                v-else-if="
                  cardCopy.type.layout === CardTypeLayout.ORGANIZATION &&
                  cardCopy.data.website
                "
              >
                {{ cardCopy.data.website }}
              </template>
            </p>
          </div>
        </div>
        <div class="pa-4 pb-0 text-body-2 font-weight-medium">
          <div class="d-flex align-center">
            About this {{ cardCopy.type.name.toLowerCase() }}
            <v-spacer />
            <template v-if="listStages?.length">
              <list-stage-selector
                v-model="cardCopy.cardLists[0].listStage"
                :listStages
              />
            </template>
          </div>
          <v-divider class="mt-3" />
        </div>
        <v-card-text>
          <template v-if="fields">
            <template v-for="field in fields" :key="field.id">
              <div class="my-4">
                <p class="field-label text-caption font-weight-light mb-1">
                  {{ field.name }}
                </p>
                <base-field
                  :field="field"
                  v-model="cardCopy.data[field.slug]"
                  @update:model-value="
                    (v: any) => updateFieldValue({ card, field, v })
                  "
                  flex-fill
                  text-field
                  type="field"
                />
              </div>
            </template>
          </template>
        </v-card-text>
      </v-card>
      <div class="base-card-content-wrapper pa-4 flex-fill align-start">
        <div class="base-card-content mx-auto">
          <div class="my-8">
            <template v-if="descriptionField">
              <base-editor-input
                :model-value="cardDescription"
                ref="descriptionInput"
                placeholder="Enter description.. (/ for commands)"
                min-height="100"
                enable-collaboration
                doc-type="card"
                :doc-id="cardCopy.id"
              />

              <base-icon-btn
                icon="mdi-paperclip"
                rounded="circle"
                @click="openDescriptionFileDialog"
              />
            </template>
            <template v-else>
              <v-skeleton-loader
                type="article"
                width="100%"
                height="150"
              ></v-skeleton-loader>
            </template>
          </div>
          <v-divider class="my-16" />
          <div>
            <template v-if="workspace?.type === WorkspaceTypes.CRM">
              <activity-input class="mb-4" :card />
            </template>
            <activity-timeline
              :card
              :hide-comment-input="workspace?.type === WorkspaceTypes.CRM"
            />
          </div>
        </div>
      </div>
    </v-card>
  </template>
</template>

<style lang="scss" scoped>
.base-card-content-wrapper {
  max-height: 100vh;
  overflow: scroll;
}

.base-card-content {
  width: 700px;
  max-width: 100%;
}
</style>
