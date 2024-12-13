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

import ActivityTimelineItemUpdateChanges from './ActivityTimelineItemUpdateChanges.vue';

const { activity, card } = defineProps<{
  activity: CardActivity;
  card: Card;
}>();

const { user, project } = storeToRefs(useAuthStore());

const { getUserFullName } = useUsersService();
const { useFieldQuery } = useFieldsService();
const { useProjectUsersQuery } = useProjectUsersService();

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
          <activity-timeline-item-update-changes
            v-if="field && users"
            :field
            :users
            :items="change.removedItems"
          />
          from {{ field?.name }}
        </template>
        <template v-else-if="change.addedItems">
          added
          <activity-timeline-item-update-changes
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
          <strong class="ms-1">
            <template v-if="field?.type === FieldTypes.DATE">{{
              dayjs(change.newValue).format('MMM DD')
            }}</template>
            <template v-else>{{ change.newValue }}</template>
          </strong>
        </template>
      </template>
      <template v-else-if="change.type === 'created'">
        created this {{ card.type.name.toLowerCase() }}
      </template>
      <span class="ms-2 text-grey">
        {{ dayjs(activity.createdAt).fromNow() }}
      </span>
    </span>
  </v-timeline-item>
</template>
