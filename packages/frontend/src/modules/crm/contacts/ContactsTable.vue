<script setup lang="tsx">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useRoute, useRouter } from 'vue-router';
import CreateContactSidebar from './CreateContactSidebar.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { onMounted } from 'vue';
import { ContactsService, type Contact } from './contacts.service';
import FalconTable, { type PaginationParams } from '@/modules/common/tables/FalconTable.vue';
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table';
import { watch } from 'vue';

const openCreateContactSidebar = useSidebarState().openSidebar;
const route = useRoute();
const router = useRouter();
const total = ref(0);
const contacts = ref<Contact[]>([]);
const tableLoading = ref(true);
const contactsService = new ContactsService();

const options = ref<PaginationParams>({
  page: 1,
  itemsPerPage: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

watch(options, () => {
  fetchContacts();
}, { deep: true });

const fetchContacts = async () => {
  const projectId = route.params.projectId as string;
  tableLoading.value = true;

  const data = await contactsService.getContacts({
    projectId,
    page: options.value.page,
    itemsPerPage: options.value.itemsPerPage,
  });

  tableLoading.value = false;
  total.value = data.total;
  contacts.value = data.contacts;
};

const deleteContact = async (contact: Contact) => {
  await contactsService.deleteContact(contact.id);
  fetchContacts();
};

const formatDate = (date: string) => {
  return dayjs(date).fromNow();
};

const viewContact = (contact: Contact) => {
  router.push({ name: 'ViewContact', params: { contactId: contact.id } });
};

const columnHelper = createColumnHelper<Contact>()
const columns: ColumnDef<Contact, any>[] = [
  columnHelper.accessor('id', {
    header: 'ID'
  }),
  columnHelper.accessor(contact => contactsService.getFullName(contact), {
    header: 'Full Name',
    id: 'fullName',
  }),
  columnHelper.accessor('emails', {
    header: 'Email',
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
  }),
  columnHelper.accessor(contact => formatDate(contact.createdAt), {
    header: 'Date Created',
    id: 'createdAt'
  }),
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div class="d-flex ga-3 py-2">
          <v-btn size="small" onclick={() => viewContact(contact)}>View</v-btn>
          <v-btn
            color="error"
            variant="outlined"
            size="small"
            onclick={() => deleteContact(contact)}
          >Delete</v-btn>
        </div >
      )
    },
  }
]

onMounted(() => {
  dayjs.extend(relativeTime);
  fetchContacts();
});
</script>

<template>
  <div class="pa-6">
    <div class="mb-4 d-flex">
      <h1 class="text-lg-h5 flex-fill">Contacts</h1>
      <v-btn @click="openCreateContactSidebar">Create Contact</v-btn>
    </div>
    <falcon-table v-model:options="options" :columns="columns" :data="contacts" :total="total" />
    <CreateContactSidebar @create="fetchContacts" />
  </div>
</template>