<template>
  <v-navigation-drawer
    v-model="isSidebarOpen"
    location="right"
    temporary
    :width="650"
  >
    <v-form v-model="formValid" @submit.prevent="createUser">
      <v-container class="d-flex flex-column">
        <h2 class="mb-2">Create a new user</h2>
        <v-text-field
          v-model="userData.firstName"
          label="First Name"
          :rules="nameRules"
          required
          color="primary"
          variant="outlined"
        />
        <v-text-field
          v-model="userData.lastName"
          label="Last Name"
          :rules="nameRules"
          required
          color="primary"
          variant="outlined"
        />
        <v-text-field
          v-model="userData.username"
          label="Username"
          :rules="nameRules"
          required
          color="primary"
          variant="outlined"
        />
        <v-text-field
          v-model="userData.email"
          label="Email"
          :rules="emailRules"
          required
          color="primary"
          variant="outlined"
        />
        <v-text-field
          v-model="userData.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          :rules="passwordRules"
          required
          color="primary"
          variant="outlined"
        />
        <div>
          <v-btn :disabled="!formValid" type="submit" color="primary"
            >Create User</v-btn
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

interface UserEntityType {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default {
  name: 'CreateUserSidebar',
  setup() {
    const { isSidebarOpen, closeSidebar } = useSidebarState();
    const { sendRequest } = useHttp();

    // Form validation rules
    const requiredRule = [(v: string) => !!v || 'This field is required'];
    const emailRule = [
      (v: string) => !!v || 'E-mail is required',
      (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ];
    const passwordRule = [
      (v: string) => !!v || 'Password is required',
      (v: string) =>
        (v && v.length >= 8) || 'Password must be at least 8 characters',
    ];

    // Form data initialization
    const userData = ref<UserEntityType>({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    });

    const formValid = ref(false);
    const showPassword = ref(false);

    // Function to create a new user
    const createUser = async () => {
      if (formValid.value) {
        try {
          const response = await sendRequest('/users', {
            method: 'POST',
            data: userData.value,
          });
          console.log(response);
          closeSidebar();
        } catch (error) {
          // Handle error
          console.error('Failed to create user:', error);
        }
      }
    };

    return {
      isSidebarOpen,
      userData,
      formValid,
      nameRules: requiredRule,
      emailRules: emailRule,
      passwordRules: passwordRule,
      showPassword,
      createUser,
    };
  },
};
</script>
