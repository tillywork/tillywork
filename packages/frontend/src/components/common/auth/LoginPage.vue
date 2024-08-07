<script setup lang="ts">
import { useLogo } from '@/composables/useLogo';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import validationUtils from '@/utils/validation';
import type { VForm } from 'vuetify/components';

const logo = useLogo();
const loginForm = ref<VForm>();
const email = ref('');
const password = ref('');
const errorMessage = ref<string[] | null>(null);
const { rules } = validationUtils;
const loading = ref(false);
const route = useRoute('/login');

const login = async () => {
  errorMessage.value = null;

  const isValid = await loginForm.value?.validate();
  if (isValid?.valid) {
    try {
      const { login } = useAuthStore();

      loading.value = true;
      await login(email.value, password.value);

      window.location.pathname = route.redirectedFrom?.fullPath ?? '/';
    } catch (error: any) {
      const { showSnackbar } = useSnackbarStore();

      loading.value = false;

      if (error.response.status === 401) {
        errorMessage.value = ['Wrong email or password.'];
      } else {
        showSnackbar({
          message: 'Something went wrong, please try again.',
          color: 'error',
        });
      }
    }
  }
};
</script>

<template>
  <v-container class="fill-height">
    <v-row class="justify-center">
      <v-col cols="12" md="7" lg="5" class="mt-n12">
        <v-img
          :src="logo.getLogoUrlByTheme()"
          alt="tillywork"
          width="150"
          class="mx-auto mb-3"
        />
        <v-form ref="loginForm" @submit.prevent="login">
          <v-card color="transparent" class="pa-4" max-width="470">
            <v-card-text>
              <v-text-field
                v-model="email"
                label="Email*"
                required
                :rules="[rules.required, rules.email]"
                :error="!!errorMessage?.length"
                autofocus
              />
              <v-text-field
                v-model="password"
                label="Password*"
                type="password"
                required
                :rules="[rules.required]"
                :error-messages="errorMessage"
              />
            </v-card-text>
            <v-card-actions class="px-4 pt-0">
              <span class="text-caption"> Don't have an account? </span>
              <v-btn class="text-none ms-1" to="/register">Register</v-btn>
              <v-spacer />
              <v-btn
                type="submit"
                variant="flat"
                color="primary"
                :loading="loading"
                class="text-none"
              >
                Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
