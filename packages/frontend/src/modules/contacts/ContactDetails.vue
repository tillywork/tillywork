<template>
  <div class="contact-information my-6" v-if="contactCopy">
    <v-form>
      <v-text-field
        v-model="contactCopy.firstName"
        label="First Name"
        density="default"
      ></v-text-field>
      <v-text-field
        v-model="contactCopy.lastName"
        label="Last Name"
        density="default"
      ></v-text-field>
      <v-text-field
        v-model="contactCopy.email"
        label="Email"
        density="default"
      ></v-text-field>
      <v-text-field
        v-model="contactCopy.phoneNumber"
        label="Phone Number"
        density="default"
      ></v-text-field>
    </v-form>

    <!-- The bar that contains the Save and Discard buttons -->
    <v-footer
      v-if="isEdited"
      app
      class="bg-surface-light d-flex ga-4 rounded border px-16"
      height="64"
    >
      <span class="text-body-1 text-surface-variant"
        >You have unsaved changes
        <span v-if="numberOfEditedFields > 0" class="font-weight-bold"
          >({{ numberOfEditedFields }} properties)</span
        ></span
      >
      <v-spacer></v-spacer>
      <v-btn
        color="error"
        @click="discardChanges"
        variant="outlined"
        :disabled="updateContactLoading"
        >Discard</v-btn
      >
      <v-btn @click="saveChanges" :loading="updateContactLoading">Save</v-btn>
    </v-footer>
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import { ContactsService, type Contact } from './contacts.service';
import { useSnackbar } from '@/composables/useSnackbar';
import objectHelper from '@/utils/object';

export default {
  name: 'ContactDetails',
  props: {
    contact: {
      type: Object,
      required: true,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { showSnackbar } = useSnackbar();
    const contactCopy = ref<Contact>({ ...(props.contact as Contact) });
    const numberOfEditedFields = ref(0);
    const updateContactLoading = ref(false);
    const isEdited = ref(false);
    const contactsService = new ContactsService();

    async function saveChanges() {
      if (contactCopy.value) {
        updateContactLoading.value = true;
        const updatedContact = await contactsService.updateContact(
          contactCopy.value as Contact
        );

        showSnackbar({
          message: 'Contact updated successfully',
          color: 'success',
        });
        isEdited.value = false;
        updateContactLoading.value = false;
        emit('update', updatedContact);
      }
    }

    function discardChanges() {
      isEdited.value = false;
      contactCopy.value = { ...(props.contact as Contact) };
    }

    watch(
      contactCopy,
      (newVal) => {
        if (newVal && !objectHelper.isEqual(newVal, props.contact)) {
          isEdited.value = true;
          numberOfEditedFields.value = objectHelper.countDifferingProperties(
            newVal,
            props.contact
          );
        } else {
          numberOfEditedFields.value = 0;
          isEdited.value = false;
        }
      },
      { deep: true }
    );

    return {
      contactCopy,
      saveChanges,
      discardChanges,
      numberOfEditedFields,
      updateContactLoading,
      isEdited,
    };
  },
};
</script>
