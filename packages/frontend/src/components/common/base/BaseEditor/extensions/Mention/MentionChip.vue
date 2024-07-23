<script setup lang="ts">
import { useUsersService } from '@/composables/services/useUsersService';
import BaseAvatar from '../../../BaseAvatar.vue';
import { nodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const { useGetUserQuery } = useUsersService();
const { data: user } = useGetUserQuery(props.node.attrs.id);
</script>

<template>
  <node-view-wrapper class="d-inline">
    <v-chip size="small" class="px-1">
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
