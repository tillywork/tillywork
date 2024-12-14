<script setup lang="ts">
import { cloneDeep } from 'lodash';

import { useStateStore } from '@/stores/state';

import { useFields } from '@/composables/useFields';
import { useCard } from '@/composables/useCard';
import { useCrm } from '@/composables/useCrm';

import { type Card } from '@tillywork/shared';

import BaseField from '@/components/common/fields/BaseField.vue';
import BaseCardStageBar from '../BaseCardStageBar.vue';
import ActivityInput from '@/components/common/inputs/CrmActivityInput/ActivityInput.vue';
import ActivityTimeline from '../BaseCardActivityTimeline/ActivityTimeline.vue';

const { card } = defineProps<{
  card: Card;
}>();

const { setTitle } = useStateStore();

const cardCopy = ref(cloneDeep(card));

const { updateFieldValue } = useCard();
const { getListByCardType } = useCrm();

const cardTypeId = computed(() => card.type.id);
const list = computed(() => getListByCardType(card.type));

const { fields, leadStageField } = useFields({ cardTypeId });

function setPersonPageTitle() {
  let title = '';

  if (card.data.first_name) {
    title = card.data.first_name;

    if (card.data.last_name) title += ` ${card.data.last_name}`;
  } else if (card.data.last_name) {
    title = card.data.last_name;
  } else if (card.data.email) {
    title = card.data.email;
  }

  setTitle(title);
}

watch(
  () => card,
  (v) => {
    if (v) {
      cardCopy.value = cloneDeep(v);
      setPersonPageTitle();
    }
  }
);
</script>

<template>
  <v-toolbar color="surface" class="px-2 border-b-thin" density="compact">
    <v-btn
      v-if="list"
      class="text-caption me-4"
      density="comfortable"
      color="primary"
      :to="`/crm/${list.slug}`"
    >
      <template #prepend>
        <v-icon icon="mdi-chevron-left" />
      </template>
      Contacts
    </v-btn>
    <v-btn
      class="text-caption me-2"
      density="comfortable"
      color="primary"
      variant="tonal"
    >
      <template #append>
        <v-icon icon="mdi-dots-vertical" />
      </template>
      Actions
    </v-btn>
    <div v-if="leadStageField && leadStageField.items" class="px-6">
      <base-card-stage-bar :card :field="leadStageField" />
    </div>
  </v-toolbar>
  <v-card
    v-if="cardCopy"
    class="d-flex flex-sm-row flex-column"
    min-height="100vh"
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
          :photo="card.data.photo"
          :text="`${card.data.first_name} ${card.data.last_name}`"
          size="64"
          class="text-body-2 me-4"
        />
        <div>
          <p class="text-body-1">
            {{ cardCopy.data.first_name }}
            {{ cardCopy.data.last_name }}
          </p>
          <p class="text-caption">
            {{ cardCopy.data.email }}
          </p>
        </div>
      </div>
      <div class="pa-4 pb-0 text-body-3 font-weight-medium">
        About this {{ cardCopy.type.name.toLowerCase() }}
        <v-divider class="mt-3" />
      </div>
      <v-card-text>
        <template v-if="fields">
          <template v-for="field in fields" :key="field.id">
            <div class="d-flex align-center my-4">
              <p class="field-label text-caption me-1">
                {{ field.name }}
              </p>
              <base-field
                :field="field"
                v-model="cardCopy.data[field.slug]"
                @update:model-value="
                    (v: any) => updateFieldValue({ card, field, v })
                  "
                flex-fill
              />
            </div>
          </template>
        </template>
      </v-card-text>
    </v-card>
    <div class="base-card-content-wrapper pa-4 flex-fill align-start">
      <div class="base-card-content mx-auto">
        <div>
          <activity-input class="mb-4" :card />
          <activity-timeline :card hide-comment-input />
        </div>
      </div>
    </div>
  </v-card>
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

.field-label {
  width: 100px;
  flex-shrink: 0;
}
</style>
