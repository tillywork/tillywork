<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Prop, PropTypes } from '../props/types';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import BaseCardPropertyValueBtn from '@/components/project-management/cards/BaseCardPropertyValueBtn.vue';
import BaseUserSelector from '@/components/common/inputs/BaseUserSelector.vue';
import dayjs from 'dayjs';
import type { User } from '@/components/common/users/types';
import type { ListStage } from '../lists/types';

const prop = defineModel<Prop>('prop');
const value = defineModel<any>('value');
const props = defineProps<{
  users?: User[];
  listStages?: ListStage[];
}>();

const hideTitle = computed(() => prop.value?.name === 'Description');
const dateValue = computed({
  get() {
    try {
      const date = dayjs(value.value).toDate();
      return date;
    } catch (e) {
      console.error('[BaseCardProperty] Invalid Date');
      return null;
    }
  },
  set(newValue) {
    value.value = dayjs(newValue).format();
  },
});

const dateDialog = ref(false);

const listStageSelector = ref();
const userSelector = ref();

function openListStageSelector() {
  if (listStageSelector.value) {
    listStageSelector.value.listStageMenu = true;
  }
}

function openUserSelector() {
  if (userSelector.value) {
    userSelector.value.userMenu = true;
  }
}
</script>

<template>
  <v-row v-if="prop" class="base-card-prop" dense align="center">
    <v-col cols="6" v-if="!hideTitle">
      <span class="text-body-2 text-high-emphasis">{{ prop.name }}</span>
    </v-col>
    <v-col class="d-flex">
      <template v-if="prop.type === PropTypes.STAGE">
        <base-card-property-value-btn @click="openListStageSelector">
          <list-stage-selector
            v-model="value"
            ref="listStageSelector"
            :listStages="listStages ?? []"
          />
        </base-card-property-value-btn>
      </template>
      <template v-else-if="prop.type === PropTypes.TEXT">
        <v-text-field
          v-model="value"
          hide-details
          single-line
          variant="outlined"
          color="accent"
        />
      </template>
      <template v-else-if="prop.type === PropTypes.TEXT_AREA">
        <div class="w-400px">
          <v-textarea v-model="value" color="accent" label="Description" />
        </div>
      </template>
      <template v-else-if="prop.type === PropTypes.USER">
        <base-card-property-value-btn @click="openUserSelector">
          <base-user-selector
            v-model="value"
            :users="users ?? []"
            ref="userSelector"
          />
        </base-card-property-value-btn>
      </template>
      <template v-else-if="prop.type === PropTypes.DATE">
        <v-menu v-model="dateDialog" :close-on-content-click="false">
          <template #activator="{ props }">
            <base-card-property-value-btn v-bind="props" class="text-body-2">
              {{ value ? dayjs(value).format('dddd, D MMM') : 'Empty' }}
            </base-card-property-value-btn>
          </template>
          <v-date-picker
            v-model="dateValue"
            show-adjacent-months
            color="primary"
          />
        </v-menu>
      </template>
    </v-col>
  </v-row>
</template>
