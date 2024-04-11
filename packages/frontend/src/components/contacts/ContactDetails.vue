<script setup lang="ts">
import { ref, watch } from 'vue';
import { ContactsService, type Contact } from './contacts.service';
import { useSnackbar } from '@/composables/useSnackbar';
import objectHelper from '@/utils/object';
import InlineInput from '../common/inputs/InlineInput.vue';
import { InlineInputTypes } from '../common/inputs/types';

const props = defineProps<{
  contact: Contact
}>();
const emit = defineEmits(['update'])
const { showSnackbar } = useSnackbar();
const contactCopy = ref<Contact>({ ...(props.contact as Contact) });
const numberOfEditedFields = ref(0);
const updateContactLoading = ref(false);
const isEdited = ref(false);
const contactsService = new ContactsService();
const isEditing = ref<string | undefined>();

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

function handlePropertyClick(key: string) {
  console.log(contactCopy.value[key])
  if (isEditing.value !== key) {
    isEditing.value = key
  }
}

async function handleUpdateProperty() {
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

function handleClearProperty() {
  discardChanges();
  isEditing.value = undefined;
}
</script>

<template>
  <div class="contact-information mt-4 mb-2" v-if="contactCopy">
    <!-- <v-form>
      <v-text-field v-model="contactCopy.firstName" label="First Name" variant="outlined"></v-text-field>
      <v-text-field v-model="contactCopy.lastName" label="Last Name"></v-text-field>
      <v-text-field v-model="contactCopy.email" label="Email"></v-text-field>
      <v-text-field v-model="contactCopy.phoneNumber" label="Phone Number"></v-text-field>
    </v-form> -->
    <inline-input v-model="contactCopy.firstName" :type="InlineInputTypes.TEXT" name="firstName" label="First Name"
      @submit:input="handleUpdateProperty" @clear:input="handleClearProperty" />
    <inline-input v-model="contactCopy.lastName" :type="InlineInputTypes.TEXT" name="lastName" label="Last Name"
      @submit:input="handleUpdateProperty" @clear:input="handleClearProperty" />
    <inline-input v-model="contactCopy.emails" :type="InlineInputTypes.ARRAY" name="email" label="Email"
      @submit:input="handleUpdateProperty" @clear:input="handleClearProperty" />
    <inline-input v-model="contactCopy.phoneNumber" :type="InlineInputTypes.TEXT" name="phoneNumber"
      label="Phone Number" @submit:input="handleUpdateProperty" @clear:input="handleClearProperty" />

    <!-- The bar that contains the Save and Discard buttons -->
    <v-footer v-if="isEdited" app class="bg-surface-light d-flex ga-4 rounded border px-16" height="64">
      <span class="text-body-1 text-surface-variant">You have unsaved changes
        <span v-if="numberOfEditedFields > 0" class="font-weight-bold">({{ numberOfEditedFields }}
          properties)</span></span>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="discardChanges" variant="outlined" :disabled="updateContactLoading">Discard</v-btn>
      <v-btn @click="saveChanges" :loading="updateContactLoading">Save</v-btn>
    </v-footer>
  </div>
</template>

<style scoped lang="scss">
.property-wrapper {
  height: 40px;
}
</style>