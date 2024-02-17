<template>
  <v-btn color="primary" class="mb-4" @click="openSidebar">Create User</v-btn>
  <v-data-table
    :items="users"
    :server-items-length="total"
    v-model:options="options"
    :loading="loading"
    class="elevation-1"
  />
  <CreateUserSidebar />
</template>

<script lang="ts">
import { ref, watch, computed } from 'vue';
import { useHttp } from '@/composables/useHttp';
import { useSidebarState } from '@/composables/useSidebarState';
import CreateUserSidebar from './CreateUserSidebar.vue';

export interface UserEntityType {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PaginationData {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
}

export interface UsersData {
  users: UserEntityType[];
  total: number;
}

export default {
  name: 'UsersTable',
  components: {
    CreateUserSidebar,
  },
  setup() {
    const { openSidebar } = useSidebarState();
    const { data, loading, sendRequest } = useHttp();

    const total = computed(() => (data.value as unknown as UsersData)?.total ?? 0);
    const users = computed(() => (data.value as unknown as UsersData)?.users ?? []);

    const options = ref({
      page: 1,
      itemsPerPage: 5,
      sortBy: [],
      sortDesc: false,
    });

    const fetchUsers = () => {
      const params: PaginationData = {
        sortBy: options.value.sortBy[0] || '',
        descending: options.value.sortDesc || false,
        page: options.value.page || 1,
        rowsPerPage: options.value.itemsPerPage || 5,
      };

      sendRequest('/users', {
        method: 'GET',
      });
    };

    watch(options, fetchUsers, { deep: true });
    fetchUsers();

    return {
      openSidebar,
      users,
      total,
      options,
      loading,
    };
  },
};
</script>
