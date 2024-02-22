<template>
  {{ contact }}
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { ContactsService, type Contact } from './contacts.service';
import { ref } from 'vue';
import { onMounted } from 'vue';

export default {
  name: 'ViewContactPage',
  emits: ['update'],
  setup(props, { emit }) {
    const route = useRoute();
    const contactsService = new ContactsService();
    const contact = ref<Contact | null>(null);

    async function fetchContact() {
      const contactId = route.params.contactId as string;
      contact.value = await contactsService.getContact(+contactId);
    }

    onMounted(() => {
      fetchContact();
    });

    return {
      contact,
    };
  },
};
</script>
