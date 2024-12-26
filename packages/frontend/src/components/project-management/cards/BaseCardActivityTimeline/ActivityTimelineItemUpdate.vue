<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

import { useUsersService } from '@/services/useUsersService';

import {
  dayjs,
  FieldTypes,
  type Card,
  type CardActivity,
  type UpdateActivityContent,
} from '@tillywork/shared';
import { useFieldsService } from '@/services/useFieldsService';
import { useProjectUsersService } from '@/services/useProjectUsersService';

import ActivityTimelineItems from './ActivityTimelineItemUpdateItems.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import { useListStagesService } from '@/services/useListStagesService';

const { activity, card } = defineProps<{
  activity: CardActivity;
  card: Card;
}>();

const { user, project } = storeToRefs(useAuthStore());

const { getUserFullName } = useUsersService();
const { useFieldQuery } = useFieldsService();
const { useProjectUsersQuery } = useProjectUsersService();
const { useGetListStagesQuery } = useListStagesService();

const change = computed(
  () => (activity.content as UpdateActivityContent).changes[0]
);
const fieldId = computed(() => change.value.field?.id ?? 0);
const fieldQueryEnabled = computed(() => !!change.value.field);

const { data: field } = useFieldQuery({
  id: fieldId,
  enabled: fieldQueryEnabled,
});

const { data: users } = useProjectUsersQuery({
  projectId: project.value!.id,
  select: (data) => data.map((projectUser) => projectUser.user),
});

const { data: listStages } = useGetListStagesQuery({
  listId: card.cardLists[0].listId,
});

const listStage = computed(() =>
  change.value.type === 'stage_updated'
    ? listStages.value?.find(
        (listStage) => listStage.id === change.value.newValue
      )
    : undefined
);
</script>

<template>
  <v-timeline-item class="text-caption">
    <template #icon>
      <base-avatar
        :text="getUserFullName(activity.createdBy)"
        :photo="activity.createdBy.photo"
        class="text-xs"
      />
    </template>
    <span class="d-flex align-start">
      {{
        user?.id === activity.createdBy.id
          ? 'You'
          : activity.createdBy.firstName
      }}
      <template v-if="change.type === 'updated'">
        <template v-if="change.removedItems">
          removed
          <activity-timeline-items
            v-if="field && users"
            :field
            :users
            :items="change.removedItems"
          />
          from {{ field?.name }}
        </template>
        <template v-else-if="change.addedItems">
          added
          <activity-timeline-items
            v-if="field && users"
            :field
            :users
            :items="change.addedItems"
          />
          to {{ field?.name }}
        </template>
        <template v-else>
          set
          <strong class="mx-1">{{ field?.name.toLowerCase() }}</strong>
          to
          <strong>
            <template
              v-if="
                field &&
                [FieldTypes.DATE, FieldTypes.DATETIME].includes(field.type)
              "
            >
              {{ dayjs(change.newValue).format('MMM DD') }}
            </template>
            <template
              v-else-if="
                field &&
                [
                  FieldTypes.DROPDOWN,
                  FieldTypes.CARD,
                  FieldTypes.USER,
                  FieldTypes.LABEL,
                ].includes(field.type)
              "
            >
              <activity-timeline-items
                v-if="field && users"
                :field
                :users
                :items="change.newValue"
              />
            </template>
            <template v-else>{{ change.newValue }}</template>
          </strong>
        </template>
      </template>
      <template v-else-if="change.type === 'created'">
        created this {{ card.type.name.toLowerCase() }}
      </template>
      <template
        v-else-if="change.type === 'stage_updated' && listStages && listStage"
      >
        moved this {{ card.type.name.toLowerCase() }} to &nbsp;
        <list-stage-selector
          :model-value="listStage"
          :list-stages="[]"
          readonly
        />
      </template>
      <span class="ms-2 text-grey">
        {{ dayjs(activity.createdAt).fromNow() }}
      </span>
    </span>
  </v-timeline-item>
</template>
