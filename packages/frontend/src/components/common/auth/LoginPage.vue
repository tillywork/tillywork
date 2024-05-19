<script setup lang="ts">
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/components';

const logo = useLogo();
const loginForm = ref<VForm>();
const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: any) => /.+@.+\..+/.test(value) || 'Email must be valid',
};
const loading = ref(false);
const route = useRoute('/login');

const login = async () => {
  if (loginForm.value?.isValid) {
    try {
      const { login } = useAuthStore();

      loading.value = true;
      await login(email.value, password.value);
      loading.value = false;
      window.location.pathname = route.redirectedFrom?.fullPath ?? '/';
    } catch (error) {
      const { showSnackbar } = useSnackbarStore();

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
  }
};
</script>

<template>
  <v-container class="fill-height">
    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="6" class="mt-n12">
        <v-img
          :src="logo.getLogoUrlByTheme()"
          alt="tillywork"
          width="225"
          class="mx-auto mb-3"
        />
        <v-form ref="loginForm" @submit.prevent="login">
          <v-card color="accent" class="pa-4">
            <v-card-title class="text-h5 mb-4">Welcome back!</v-card-title>
            <v-card-text>
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
            </v-card-text>
            <v-card-actions class="px-4 pt-0">
              <v-spacer />
              <v-btn
                type="submit"
                variant="flat"
                color="primary"
                :loading="loading"
                class="text-body-2"
                >Login</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
