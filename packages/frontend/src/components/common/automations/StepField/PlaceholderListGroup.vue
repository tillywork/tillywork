<script setup lang="ts">
import stringUtils from '@/utils/string';

import PlaceholderListItem from './PlaceholderListItem.vue';
import {
  type Automation,
  type AutomationHandlerMetadata,
} from '@tillywork/shared';

const {
  value,
  groupKey,
  parentPath = '',
} = defineProps<{
  value: any;
  groupKey: string | number;
  parentPath?: string;
}>();

const emit = defineEmits(['select']);
const automation = inject<Ref<Automation>>('automation');
const triggers = inject<Ref<AutomationHandlerMetadata[]>>('triggers');
const actions = inject<Ref<AutomationHandlerMetadata[]>>('actions');

function handleSelectPlaceholder(placeholderPath: string) {
  const fullPath = parentPath
    ? `${parentPath}.${placeholderPath}`
    : placeholderPath.toString();

  emit('select', fullPath);
}

const groupLabel = computed(() => {
  const defaultLabel = stringUtils.objectKeyToDisplayFormat(
    groupKey.toString()
  );

  if (groupKey === 'trigger' && automation && triggers) {
    const selectedTrigger = triggers.value.find(
      (t) => t.value === automation.value.trigger.value
    );

    const label = `Trigger: ${selectedTrigger?.title ?? 'None'}`;
    return label;
  } else if (actions) {
    const match = groupKey.toString().match(/\d+$/);

    if (!match) {
      return defaultLabel;
    }

    const stepIndex = parseInt(match[0]) - 1;
    const selectedAction = actions?.value.find(
      (a) => a.value === automation?.value.steps[stepIndex].value
    );

    return `${stepIndex + 1}. ${selectedAction?.title ?? defaultLabel}`;
  }

  return defaultLabel;
});
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-list-group v-bind="hoverProps" :value="groupKey">
      <template #activator="{ props }">
        <v-list-item v-bind="props" :ripple="false" height="35" min-height="35">
          <v-list-item-title class="user-select-none d-flex align-center">
            {{ groupLabel }}

            <v-btn
              v-if="isHovering"
              class="text-caption ms-2"
              icon
              density="compact"
              color="default"
              variant="text"
              @click.stop="handleSelectPlaceholder(groupKey.toString())"
              v-tooltip="'Send to input'"
            >
              <v-icon icon="mdi-import" color="primary" size="20" />
            </v-btn>
          </v-list-item-title>
        </v-list-item>
      </template>
      <template v-for="(subValue, subKey) in value" :key="subKey">
        <template v-if="typeof subValue === 'object' && subValue !== null">
          <placeholder-list-group
            :value="subValue"
            :group-key="subKey"
            :parent-path="groupKey.toString()"
            @select="handleSelectPlaceholder"
          />
        </template>

        <placeholder-list-item
          v-else
          :item-value="subValue"
          :placeholder-path="subKey"
          :parent-path="groupKey.toString()"
          @select="handleSelectPlaceholder"
        />
      </template>
    </v-list-group>
  </v-hover>
</template>
