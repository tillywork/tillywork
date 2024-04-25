<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h5 mb-6">Welcome back!</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Email"
                required
                :rules="[rules.required, rules.email]"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-btn type="submit" color="primary" :loading="loading"
                >Login</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useSnackbar } from '@/composables/useSnackbar';
import { useRoute } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: any) => /.+@.+\..+/.test(value) || 'Email must be valid',
};
const loading = ref(false);
const route = useRoute();

const login = async () => {
  try {
    const { login } = useAuth();

    loading.value = true;
    await login(email.value, password.value);
    loading.value = false;
    window.location.pathname = route.redirectedFrom?.fullPath ?? '/';
  } catch (error) {
    const { showSnackbar } = useSnackbar();

    loading.value = false;
    const errorObj = (error as any).value ?? error;

    console.error(errorObj);

    if (errorObj.statusCode === 401) {
      errorMessage.value = 'Invalid email or password';
    } else {
      errorMessage.value = 'An unknown error occurred';
    }
    showSnackbar({
      message: errorMessage.value,
      color: 'error',
    });
  }
};
</script>
