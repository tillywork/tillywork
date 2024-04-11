<script lang="ts">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useSnackbar } from '@/composables/useSnackbar';
import { useAuth } from '@/composables/useAuth';
import type { VForm } from 'vuetify/lib/components/index.mjs';
import { ContactsService, type CreateContact } from './contacts.service';
import { validation } from '@/utils/validation';

export default {
  name: 'CreateContactSidebar',
  emits: ['create'],
  setup(props, { emit }) {
    const { isSidebarOpen, closeSidebar } = useSidebarState();
    const { showSnackbar } = useSnackbar();
    const { selectedProjectId } = useAuth();
    const contactsService = new ContactsService();

    const atLeastOneFieldFilledRule = [
      () => {
        const fields = [
          contactData.value.firstName,
          contactData.value.lastName,
          contactData.value.email,
          contactData.value.phoneNumber,
        ];
        const isAnyFieldFilled = fields.some(
          (field) => field && field.length > 0
        );
        return (
          isAnyFieldFilled ||
          'At least one of these fields should be filled'
        );
      },
    ];
    const createForm = ref<null | VForm>(null);
    const loading = ref(false);

    // Form data initialization
    const contactData = ref<CreateContact>({
      projectId: selectedProjectId!,
      otherEmails: [],
    });

    const addOtherEmailField = () => {
      const otherEmails = contactData.value.otherEmails!;
      if (otherEmails.length === 0 || otherEmails[otherEmails.length - 1])
        contactData.value.otherEmails!.push('');
    };

    const removeOtherEmailField = (index: number) => {
      contactData.value.otherEmails!.splice(index, 1);
    };

    const createContact = async () => {
      try {
        const isFormValid = await createForm.value?.validate();

        if (isFormValid?.valid) {
          loading.value = true;

          const contact = await contactsService.createContact(
            contactData.value
          );
          emit('create', contact);

          closeSidebar();
          showSnackbar({
            message: 'Contact created successfully!',
            color: 'success',
          });

          createForm.value?.reset();
          loading.value = false;
        }
      } catch (error) {
        // Handle error
        console.error('Failed to create contact:', error);
        showSnackbar({
          message: 'Something went wrong! Please try again.',
          color: 'error',
        });
        loading.value = false;
      }
    };

    return {
      isSidebarOpen,
      contactData,
      validation,
      atLeastOneFieldFilledRule,
      createContact,
      loading,
      createForm,
      addOtherEmailField,
      removeOtherEmailField,
    };
  },
};
</script>

<template>
  <v-navigation-drawer v-model="isSidebarOpen" location="right" temporary :width="450">
    <v-form ref="createForm" @submit.prevent="createContact">
      <v-container class="d-flex flex-column ga-2">
        <span class="text-h5 mb-4 mt-12 font-weight-bold">Create a new contact</span>
        <v-text-field v-model="contactData.firstName" label="First Name" :rules="atLeastOneFieldFilledRule" />
        <v-text-field v-model="contactData.lastName" label="Last Name" :rules="atLeastOneFieldFilledRule" />
        <v-text-field v-model="contactData.email" label="Email"
          :rules="[validation.rules.email, ...atLeastOneFieldFilledRule]" />
        <v-text-field v-model="contactData.phoneNumber" label="Phone Number"
          :rules="[validation.rules.phoneNumber, ...atLeastOneFieldFilledRule]" />

        <template v-if="contactData.otherEmails">
          <span class="subtitle-2 mb-3">Other Emails</span>
          <v-btn block @click="addOtherEmailField"> Add Another Email </v-btn>

          <div v-for="(otherEmail, index) in contactData.otherEmails" :key="index" class="mb-2">
            <v-text-field v-model="contactData.otherEmails[index]" :rules="[validation.rules.email]" label="Other Email"
              @click:clear="removeOtherEmailField(index)" clearable persistent-clear />
          </div>
        </template>
        <div class="mt-16">
          <v-btn :loading="loading" type="submit" width="100%" height="40px">Create</v-btn>
        </div>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>