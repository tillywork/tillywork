<template>
  <!-- Page wrapper -->
  <div
    v-if="contact"
    class="d-flex"
    style="min-height: calc(100vh - 48px)"
  >
    <!-- Left hand bar -->
    <v-col cols="3" class="rounded-e border-e border-t">
      <div class="left-bar-wrapper">
        <div class="header-wrapper pb-4 border-b">
          <!-- User basic info banner -->
          <div class="contact-basic-info d-flex align-center ga-3">
            <v-avatar size="80">
              <v-img
                v-if="contact.photo"
                :src="contact.photo"
                width="80"
                height="80"
              />
              <v-icon
                v-else
                icon="mdi-account-circle"
                size="80"
                color="primary"
              ></v-icon>
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="text-h5">{{ printFullName(contact) }}</span>
              <span class="text-body-1">{{ contact.email }}</span>
            </div>
          </div>
        </div>
        <!-- User properties -->
        <ContactDetails :contact="contact" :key="contact.updatedAt" @update="fetchContact()"/>
      </div>
    </v-col>
    <v-col cols="9" class="bg-surface rounded-s border-t">
      <v-container>
        <span class="text-h4">Overview</span>
      </v-container>
    </v-col>
  </div>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { ContactsService, type Contact } from './contacts.service';
import { ref } from 'vue';
import ContactDetails from './ContactDetails.vue';

export default {
    name: 'ViewContactPage',
    components: { ContactDetails },
    setup() {
        const route = useRoute();
        const contactsService = new ContactsService();
        const contact = ref<Contact>();

        async function fetchContact() {
            const contactId = route.params.contactId as string;
            contact.value = await contactsService.getContact(+contactId);
        }

        fetchContact();

        return {
            contact,
            printFullName: contactsService.getFullName,
            fetchContact,
        };
    },
};
</script>