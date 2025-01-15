<script setup lang="ts">
import BaseAvatar from '../../../BaseAvatar.vue';
import { nodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { useAuthStore } from '@/stores/auth';
import { useQueryStore } from '@/stores/query';

const props = defineProps(nodeViewProps);

const { user: currentUser } = storeToRefs(useAuthStore());
const { users } = storeToRefs(useQueryStore());

const user = computed(() =>
  users.value?.find((user) => user.id === props.node.attrs.id)
);
</script>

<template>
  <node-view-wrapper class="d-inline">
    <v-chip
      size="small"
      class="px-1"
      :color="user?.id === currentUser?.id ? 'primary' : undefined"
    >
      <template v-if="user">
        <base-avatar
          :text="user.firstName + ' ' + user.lastName"
          :photo="user.photo"
          class="me-2"
          :size="20"
        />
        {{ user.firstName + ' ' + user.lastName }}
      </template>
      <template v-else>
        <v-progress-circular width="2" size="16" color="primary" />
      </template>
    </v-chip>
  </node-view-wrapper>
</template>
