<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useUsersService } from '@/services/useUsersService';
import {
  dayjs,
  type Card,
  type CardActivity,
  type UpdateActivityContent,
} from '@tillywork/shared';
import { useFieldsService } from '@/services/useFieldsService';
import ActivityTimelineItems from './ActivityTimelineItemUpdateItems.vue';
import ListStageSelector from '@/components/common/inputs/ListStageSelector.vue';
import { useQueryStore } from '@/stores/query';

interface Props {
  activity: CardActivity;
  card: Card;
}

const props = defineProps<Props>();

const { user } = storeToRefs(useAuthStore());
const { users, listStages } = storeToRefs(useQueryStore());

const { getUserFullName } = useUsersService();
const { useFieldQuery } = useFieldsService();

// Extract activity content and changes
const activityContent = computed(
  () => props.activity.content as UpdateActivityContent
);
const change = computed(() => activityContent.value.changes[0]);

// Field-related computeds
const fieldId = computed(() => change.value.field?.id ?? 0);
const fieldQueryEnabled = computed(() => Boolean(change.value.field));

// Queries
const { data: field } = useFieldQuery({
  id: fieldId,
  enabled: fieldQueryEnabled,
});

const listStage = computed(() =>
  change.value.type === 'stage_updated'
    ? listStages.value?.find((stage) => stage.id == change.value.newValue)
    : undefined
);

const isCurrentUser = computed(
  () => user.value?.id === props.activity.createdBy.id
);

const displayName = computed(() =>
  isCurrentUser.value ? 'You' : props.activity.createdBy.firstName
);

const itemType = computed(() => props.card.type.name.toLowerCase());

const getActivityTypeDetails = (change: any) => {
  if (change.type === 'updated') {
    if (change.removedItems)
      return { action: 'removed', items: change.removedItems, suffix: 'from' };
    if (change.addedItems)
      return { action: 'added', items: change.addedItems, suffix: 'to' };
    if (change.newValue)
      return { action: 'set', items: change.newValue, suffix: 'to' };
    if (change.oldValue)
      return { action: 'removed', items: change.oldValue, suffix: 'from' };
    return { action: 'cleared', items: null, suffix: null };
  }
  return null;
};
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

    <div class="d-flex flex-wrap align-center ga-1">
      <span>{{ displayName }}</span>

      <!-- Updated type activities -->
      <template v-if="change.type === 'updated' && field">
        <template v-if="field && users">
          <span>{{ getActivityTypeDetails(change)?.action }}</span>

          <template v-if="getActivityTypeDetails(change)?.action === 'set'">
            <span>{{ field.name }}</span>

            <template v-if="getActivityTypeDetails(change)?.suffix">
              <span>{{ getActivityTypeDetails(change)?.suffix }}</span>
            </template>

            <template v-if="getActivityTypeDetails(change)?.items">
              <activity-timeline-items
                :field="field"
                :users="users"
                :items="getActivityTypeDetails(change)?.items"
              />
            </template>
          </template>
          <template v-else>
            <template v-if="getActivityTypeDetails(change)?.items">
              <activity-timeline-items
                :field="field"
                :users="users"
                :items="getActivityTypeDetails(change)?.items"
              />
            </template>

            <template v-if="getActivityTypeDetails(change)?.suffix">
              <span>{{ getActivityTypeDetails(change)?.suffix }}</span>
            </template>
            <span>{{ field.name }}</span>
          </template>
        </template>
      </template>

      <!-- Created type activities -->
      <template v-else-if="change.type === 'created'">
        <span>created this {{ itemType }}</span>
      </template>

      <!-- Stage updated activities -->
      <template
        v-else-if="change.type === 'stage_updated' && listStages && listStage"
      >
        <span>moved this {{ itemType }} to</span>
        <list-stage-selector
          :model-value="listStage"
          :list-stages="[]"
          readonly
        />
      </template>

      <span class="text-grey">{{ dayjs(activity.createdAt).fromNow() }}</span>
    </div>
  </v-timeline-item>
</template>
