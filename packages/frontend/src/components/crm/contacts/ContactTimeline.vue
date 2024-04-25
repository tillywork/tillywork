<script setup lang="tsx">
import { ref } from 'vue';
import {
  useNotesService,
  type Note,
} from '@/composables/services/useNotesService';
import { onMounted } from 'vue';
import BlockNote from '@/components/common/inputs/BlockNote.vue';
import type { Contact } from '@/composables/services/useContactsService';

const { contact } = defineProps<{
  contact: Contact;
}>();
const note = ref('');
const notesService = useNotesService();
const options = ref({
  page: 1,
  itemsPerPage: 5,
  sortBy: [
    {
      key: 'createdAt',
      order: 'desc',
    },
  ],
  search: '',
});
const notes = ref<Note[]>([]);

async function createNote() {
  await notesService.create({
    note: note.value,
    entityType: 'contact',
    entityId: contact.id,
  });
  fetchContactNotes();
}

async function fetchContactNotes() {
  const { page, itemsPerPage, sortBy } = options.value;
  const result = await notesService.getContactNotes({
    contactId: contact.id,
    page,
    itemsPerPage,
    sortBy,
  });

  notes.value = result.notes;
}

onMounted(() => {
  fetchContactNotes();
});
</script>

<template>
  <div class="my-6">
    <div class="w-50 flex">
      <div class="block-note-wrapper py-4 my-2 bg-surface rounded border">
        <block-note />
      </div>
      <v-btn @click="createNote">Create Note</v-btn>
    </div>
    <v-timeline class="mt-4" density="compact" truncate-line="end">
      <v-timeline-item v-for="note in notes" :key="note.id">
        <span class="font-weight-bold">{{ note.note }} -</span>
        <span>&nbsp;{{ note.createdAt }}</span>
      </v-timeline-item>
      <v-timeline-item
        size="small"
        dot-color="accent"
        icon="mdi-account-circle"
        fill-dot
      >
        <div class="d-flex">
          <span class="font-weight-bold">Contact Created -</span>
          <span>&nbsp;{{ contact.createdAt }}</span>
        </div>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<style scoped>
.block-note-wrapper {
  min-height: 150px;
}
</style>
