<!-- eslint-disable vue/valid-v-slot -->
<script setup lang="ts">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useRoute, useRouter } from 'vue-router';
import CreateContactSidebar from './CreateContactSidebar.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { watch } from 'vue';
import { onMounted } from 'vue';
import { ContactsService, type Contact } from './contacts.service';

const openCreateContactSidebar = useSidebarState().openSidebar;
const route = useRoute();
const router = useRouter();

const options = ref({
  page: 1,
  itemsPerPage: 25,
  sortBy: [
    {
      key: 'createdAt',
      order: 'desc',
    },
  ],
  search: '',
});
const total = ref(0);
const contacts = ref([] as Contact[]);
const tableLoading = ref(true);
const selectedContacts = ref([] as Contact[]);
const contactsService = new ContactsService();

const contactsHeaders = [
  {
    title: 'ID',
    value: 'id',
    sortable: true,
    width: 100,
  },
  {
    title: 'Full Name',
    key: 'fullName',
    value: (item: Contact) => printFullName(item),
    sortable: false,
    width: 200,
  },
  {
    title: 'Email',
    value: 'email',
    sortable: true,
    width: 300,
  },
  {
    title: 'Phone Number',
    value: 'phoneNumber',
    sortable: true,
    width: 200,
  },
  {
    title: 'Other Emails',
    value: 'otherEmails',
    sortable: false,
    width: 400,
  },
  {
    title: 'Date Created',
    key: 'createdAt',
    value: (item: Contact) => formatDate(item.createdAt),
    sortable: true,
    width: 200,
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
];

const fetchContacts = async () => {
  const projectId = route.params.projectId as string;
  const { page, itemsPerPage, sortBy } = options.value;
  tableLoading.value = true;

  const data = await contactsService.getContacts({
    projectId,
    page,
    itemsPerPage,
    sortBy,
  });

  tableLoading.value = false;
  total.value = data.total;
  contacts.value = data.contacts;
};

const deleteContact = async (contact: Contact) => {
  await contactsService.deleteContact(contact.id);
  fetchContacts();
};

const printFullName = (contact: Contact) => {
  if (contact.firstName && contact.lastName) {
    return `${contact.firstName} ${contact.lastName}`;
  } else if (contact.firstName) {
    return contact.firstName;
  } else if (contact.lastName) {
    return contact.lastName;
  } else {
    return '';
  }
};

const formatDate = (date: string) => {
  return dayjs(date).fromNow();
};

const viewContact = (contact: Contact) => {
  router.push({ name: 'ViewContact', params: { contactId: contact.id } });
};

onMounted(() => {
  dayjs.extend(relativeTime);
  fetchContacts();
  watch(options, fetchContacts, { deep: true });
});
</script>

<template>
  <div class="pa-6">
    <div class="mb-4 d-flex">
      <h1 class="text-lg-h5 flex-fill">Contacts</h1>
      <v-btn @click="openCreateContactSidebar">Create Contact</v-btn>
    </div>
    <v-data-table-server
      v-model="selectedContacts"
      density="compact"
      :items="contacts"
      :headers="contactsHeaders"
      :items-length="total"
      :items-per-page="25"
      v-model:options="options"
      :loading="tableLoading"
      loading-text="Loading contacts..."
      show-select
      return-object
      class="rounded border"
    >
      <template #item.actions="{ item }">
        <div class="d-flex ga-3 py-2">
          <v-btn size="small" @click="viewContact(item)">View</v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            @click="deleteContact(item)"
            >Delete</v-btn
          >
        </div>
      </template>
    </v-data-table-server>
    <CreateContactSidebar @create="fetchContacts" />
  </div>
</template>
