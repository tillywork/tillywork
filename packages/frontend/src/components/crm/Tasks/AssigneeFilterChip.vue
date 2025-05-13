<script setup lang="ts">
import { useQueryStore } from '@/stores/query';

import MenuWrapper from '@/components/common/base/ContextMenu/MenuWrapper.vue';

const attrs = useAttrs();
const selected = defineModel<number[]>({
  default: [],
});

const { users } = storeToRefs(useQueryStore());

const selectedUsers = computed(
  () => users.value?.filter((user) => selected.value.includes(user.id)) ?? []
);

const chipLabel = computed(() => {
  if (!selected.value.length || !selectedUsers.value[0]) {
    return 'Assignee';
  }

  if (selected.value.length > 1) {
    return `Assignee is any of ${selected.value.length}`;
  }

  return `Assignee is ${selectedUsers.value[0].firstName}`;
});

function clearValue() {
  selected.value = [];
}
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-chip
        v-bind="{
          ...props,
          ...attrs,
        }"
        class="text-caption text-medium-emphasis bg-accent-lighten"
        density="compact"
        border="thin"
        :style="{
          width: 'fit-content',
        }"
      >
        <template #prepend>
          <v-icon icon="mdi-account" start />
        </template>
        {{ chipLabel }}

        <template #close v-if="selected.length">
          <v-btn
            icon
            density="compact"
            size="small"
            color="transparent"
            variant="flat"
            @click.stop="clearValue"
          >
            <v-icon icon="mdi-close" />
          </v-btn>
        </template>
      </v-chip>
    </template>
    <template #default="{ isActive }">
      <menu-wrapper
        v-model="selected"
        :items="
          users?.map((u) => ({
            title: `${u.firstName} ${u.lastName}`,
            value: u.id,
            photo: u.photo,
            avatar: true,
          }))
        "
        selectable
        multiple
        :open="isActive.value"
      />
    </template>
  </v-menu>
</template>
