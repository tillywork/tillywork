<template>
  <v-navigation-drawer
    v-model="isSidebarOpen"
    location="right"
    temporary
    :width="450"
  >
    <v-form v-model="formValid" @submit.prevent="createContact">
      <v-container class="d-flex flex-column ga-1">
        <h2 class="mb-2">Create a new contact</h2>
        <v-text-field
          v-model="contactData.firstName"
          label="First Name"
        />
        <v-text-field
          v-model="contactData.lastName"
          label="Last Name"
        />
        <v-text-field
          v-model="contactData.email"
          label="Email"
          :rules="emailRule"
        />
        <div>
          <v-btn :disabled="!formValid" :loading="loading" type="submit"
            >Create</v-btn
          >
        </div>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useSidebarState } from '@/composables/useSidebarState';
import { useHttp } from '@/composables/useHttp';
import { useSnackbar } from '@/composables/useSnackbar';
import { useAuth } from '@/composables/useAuth';

interface CreateContactDto { 
  firstName: string;
  lastName: string;
  email: string;
  projectId: number;
}

export default {
  name: 'CreateContactSidebar',
  emits: ['create'],
  setup(props, { emit }) {
    const { isSidebarOpen, closeSidebar } = useSidebarState();
    const { loading, data, sendRequest } = useHttp();
    const { showSnackbar } = useSnackbar();
    const { selectedProjectId } = useAuth();

    // Form validation rules
    const formValid = ref(false);
    const requiredRule = [(v: string) => !!v || 'This field is required'];
    const emailRule = [
      (v: string) => !!v || 'Email is required',
      (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
    ];

    // Form data initialization
    const contactData = ref<CreateContactDto>({
      firstName: '',
      lastName: '',
      email: '',
      projectId: selectedProjectId!,
    });

    const createContact = async () => {
      if (formValid.value) {
        try {
          await sendRequest('/contacts', {
            method: 'POST',
            data: contactData.value,
          });
          closeSidebar();
          emit('create', data.value)
          showSnackbar({
            message: 'Contact created successfully!',
            color: 'success',
          });
        } catch (error) {
          // Handle error
          console.error('Failed to create contact:', error);
          showSnackbar({
            message: 'Something went wrong! Please try again.',
            color: 'error',
          });
        }
      }
    };

    return {
      isSidebarOpen,
      contactData,
      formValid,
      nameRules: requiredRule,
      emailRule,
      createContact,
      loading,
    };
  },
};
</script>
