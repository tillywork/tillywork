<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {
  useContactsService,
  type Contact,
} from '../../../composables/services/useContactsService';
import { ref } from 'vue';
import ContactDetails from './ContactDetails.vue';
import ContactTimeline from './ContactTimeline.vue';
import { useDisplay } from 'vuetify';

const { name } = useDisplay();

const route = useRoute();
const router = useRouter();
const contactsService = useContactsService();
const contact = ref<Contact | null>();
const contactDropdownMenu = ref([
  {
    title: 'Delete Contact',
    click: (contact: Contact) => deleteContact(contact),
  },
]);

async function fetchContact() {
  const contactId = route.params.contactId as string;
  contact.value = await contactsService.getContact(+contactId);
  if (!contact.value) {
    router.push({ name: 'Contacts' });
  }

  document.title =
    contactsService.getFullName(contact.value) + ' | FalconDrive';
}

async function deleteContact(contact: Contact) {
  await contactsService.deleteContact(contact.id);
  fetchContact();
  return contact.id;
}

fetchContact();
</script>

<template>
  <!-- Page wrapper -->
  <div v-if="contact" class="d-flex" style="min-height: calc(100vh - 48px)">
    <!-- Left hand bar -->
    <div class="rounded-e border-e border-t w-400px pa-3">
      <div class="left-bar-wrapper">
        <div class="header-wrapper pb-4 border-b">
          <!-- User basic info banner -->
          <div class="contact-basic-info d-flex align-center ga-3">
            <v-avatar size="50">
              <v-img
                v-if="contact.photo"
                :src="contact.photo"
                width="80"
                height="50"
              />
              <v-icon
                v-else
                icon="mdi-account-circle"
                size="50"
                color="primary"
              ></v-icon>
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="text-body-1 text-truncate">{{
                contactsService.getFullName(contact)
              }}</span>
              <span class="text-body-2 text-truncate">{{
                contact.emails[0]
              }}</span>
            </div>
            <v-spacer />
            <v-btn
              id="contact-menu-activator"
              density="comfortable"
              variant="text"
              icon="mdi-dots-vertical"
              rounded="default"
            />
          </div>
        </div>
        <!-- User properties -->
        <ContactDetails
          :contact="contact"
          :key="contact.updatedAt"
          @update="fetchContact()"
        />
      </div>

      <v-menu activator="#contact-menu-activator" location="bottom right">
        <v-list>
          <v-list-item
            v-for="item in contactDropdownMenu"
            :key="item.title"
            @click="item.click(contact)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div class="bg-surface rounded-s border-t w-100-400px">
      <v-container>
        <span class="text-h4">Overview</span>
        <ContactTimeline :contact="contact" />
      </v-container>
    </div>
  </div>
</template>
