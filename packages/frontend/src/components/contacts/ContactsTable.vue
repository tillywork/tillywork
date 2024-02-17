<template>
  <div class="mb-4 d-flex">
    <h1 class="text-lg-h5 flex-fill">Contacts</h1>
    <v-btn color="primary" rounded="lg" elevation="0">Create Contact</v-btn>
  </div>
  <v-data-table :items="contacts" :server-items-length="total" v-model:options="options" :loading="loading"
    class="rounded border" height="50vh" />
</template>

<script lang="ts">
import { ref, watch, computed } from 'vue';
import { useHttp } from '@/composables/useHttp';
import { useSidebarState } from '@/composables/useSidebarState';
import { useRoute } from 'vue-router';

interface Contact {
  name: string;
  ownerId: string;
}

interface PaginationData {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
}

interface ContactsData {
  contacts: Contact[];
  total: number;
}

export default {
  name: 'ContactsTable',
  components: {
  },
  setup() {
    const { openSidebar } = useSidebarState();
    const { data, loading, sendRequest } = useHttp();
    const route = useRoute();

    const total = computed(() => (data.value as unknown as ContactsData)?.total ?? 0);
    const contacts = computed(() => (data.value as unknown as ContactsData)?.contacts ?? []);

    const options = ref({
      page: 1,
      itemsPerPage: 5,
      sortBy: [],
      sortDesc: false,
    });

    const fetchContacts = () => {
      const params: PaginationData = {
        sortBy: options.value.sortBy[0] || '',
        descending: options.value.sortDesc || false,
        page: options.value.page || 1,
        rowsPerPage: options.value.itemsPerPage || 5,
      };
      const projectId = route.params.projectId

      sendRequest('/contacts', {
        method: 'GET',
        params: {
          projectId,
        }
      });
    };

    watch(options, fetchContacts, { deep: true });
    fetchContacts();

    return {
      openSidebar,
      contacts,
      total,
      options,
      loading,
    };
  },
};
</script>
