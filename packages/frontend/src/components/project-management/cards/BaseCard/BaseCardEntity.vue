<script setup lang="ts">
import { cloneDeep } from 'lodash';

import { useStateStore } from '@/stores/state';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';

import { useListStagesService } from '@/services/useListStagesService';
import { useCardsService } from '@/services/useCardsService';

import { useFields } from '@/composables/useFields';
import { useCard } from '@/composables/useCard';
import { useCrm } from '@/composables/useCrm';

import {
  CardTypeLayout,
  ListType,
  WorkspaceTypes,
  type Card,
  type ListStage,
} from '@tillywork/shared';

import BaseField from '@/components/common/fields/BaseField.vue';
import ActivityInput from '@/components/common/inputs/CrmActivityInput/ActivityInput.vue';
import ActivityTimeline from '../BaseCardActivityTimeline/ActivityTimeline.vue';
import BaseCardToolbar from './BaseCardToolbar.vue';

const { card } = defineProps<{
  card: Card;
}>();

const { workspace } = storeToRefs(useAuthStore());
const { setTitle } = useStateStore();
const { showSnackbar } = useSnackbarStore();

const cardCopy = ref(cloneDeep(card));

const { updateFieldValue } = useCard();
const { getListByCardType } = useCrm();

const cardTypeId = computed(() => card.type.id);
const list = computed(() => getListByCardType(card.type));
const listId = computed(() => list.value?.id ?? 0);
const listStagesEnabled = computed(() => !!list.value);

const { useUpdateCardListMutation } = useCardsService();
const { mutateAsync: updateCardStage } = useUpdateCardListMutation();
const { useGetListStagesQuery } = useListStagesService();
const { data: listStages } = useGetListStagesQuery({
  listId,
  enabled: listStagesEnabled,
});

const { fields, titleField, photoField } = useFields({
  cardTypeId,
});

function getPersonName(): string {
  let name = '';

  if (card.data.first_name) {
    name = card.data.first_name;

    if (card.data.last_name) name += ` ${card.data.last_name}`;
  } else if (card.data.last_name) {
    name = card.data.last_name;
  }

  return name;
}

function getEntityName(): string {
  if (titleField.value) {
    return card.data[titleField.value.slug];
  } else if (card.type.layout === CardTypeLayout.PERSON) {
    return getPersonName();
  } else {
    return '';
  }
}

function setPageTitle() {
  const title = getEntityName();
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

watch(
  () => card,
  (v) => {
    if (v) {
      cardCopy.value = cloneDeep(v);
      setPageTitle();
    }
  },
  { immediate: true }
);

watch(titleField, () => setPageTitle());

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
            :text="getEntityName()"
            size="64"
            class="text-body-2 me-4"
          />
          <div>
            <p class="text-body-1">
              {{ getEntityName() }}
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
                />
              </div>
            </template>
          </template>
        </v-card-text>
      </v-card>
      <div class="base-card-content-wrapper pa-4 flex-fill align-start">
        <div class="base-card-content mx-auto">
          <div>
            <activity-input
              v-if="workspace?.type === WorkspaceTypes.CRM"
              class="mb-4"
              :card
            />
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
  width: 650px;
  max-width: 100%;
}
</style>
