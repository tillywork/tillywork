<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import validationUtils from '@/utils/validation';
import type { VForm } from 'vuetify/components';
// import 'flag-icons/css/flag-icons.min.css';
// import 'v-phone-input/dist/v-phone-input.css';
// import { VPhoneInput } from 'v-phone-input';
import { useLogo } from '@/composables/useLogo';
import { type CreateUserDto } from '../users/types';
import posthog from 'posthog-js';

defineProps<{
  header?: string;
}>();

const logo = useLogo();
const registerForm = ref<VForm>();
const createUserDto = ref<CreateUserDto>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  country: '',
  inviteCode: '',
});
const errorMessage = ref<string | null>(null);
const loading = ref(false);
const route = useRoute('/register');
const { rules } = validationUtils;
const { showSnackbar } = useSnackbarStore();
const { register, registerWithInvite } = useAuthStore();

const inviteCode = computed(() => route.query.inviteCode);

async function handleRegister() {
  if (registerForm.value?.isValid) {
    try {
      loading.value = true;

      const response = inviteCode.value
        ? await registerWithInvite({
            ...createUserDto.value,
            inviteCode: inviteCode.value as string,
          })
        : await register(createUserDto.value);
      if (response.error) {
        loading.value = false;
      } else {
        const { password, ...userObj } = response;
        posthog.identify(response.id, userObj);
        posthog.capture('Signup', { email: createUserDto.value.email });

        if (
          route.redirectedFrom?.fullPath &&
          route.redirectedFrom?.path !== `/invite/${inviteCode.value}`
        ) {
          window.location.pathname = route.redirectedFrom.fullPath;
        } else {
          window.location.pathname = '/';
        }
      }
    } catch (error) {
      loading.value = false;
      const errorObj = (error as any).value ?? error;

      console.error(errorObj);
      errorMessage.value = 'Something went wrong, please try again.';

      showSnackbar({
        message: errorMessage.value,
        color: 'error',
      });
    }
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row class="justify-center">
      <v-col cols="12" md="7" lg="5" class="mt-n4">
        <v-img
          :src="logo.getLogoUrlByTheme()"
          alt="tillywork"
          width="150"
          class="mx-auto mb-3"
        />
        <v-form ref="registerForm" @submit.prevent="handleRegister">
          <v-card
            color="transparent"
            class="px-4 py-2 mx-auto"
            :loading
            max-width="470"
          >
            <v-card-title class="text-h6 mb-2">
              {{ header ?? 'Create a free account' }}
            </v-card-title>
            <v-card-text class="pb-0">
              <div class="d-flex ga-2 mb-1">
                <v-text-field
                  v-model="createUserDto.firstName"
                  label="First Name*"
                  required
                  :rules="[rules.required]"
                  autofocus
                />
                <v-text-field
                  v-model="createUserDto.lastName"
                  label="Last Name*"
                  required
                  :rules="[rules.required]"
                />
              </div>
              <v-text-field
                v-model="createUserDto.email"
                label="Email*"
                required
                :rules="[rules.required, rules.email]"
                class="mb-1"
              />
              <v-text-field
                v-model="createUserDto.password"
                label="Password*"
                type="password"
                required
                :rules="[rules.required]"
              />
              <!-- <v-phone-input
                v-model="createUserDto.phoneNumber"
                v-model:country="createUserDto.country"
                label="Phone*"
                country-icon-mode="svg"
                enable-searching-country
                density="compact"
                :rules="[rules.required]"
              /> -->
            </v-card-text>
            <v-card-actions class="px-4 pt-0">
              <template v-if="!inviteCode">
                <span class="text-caption"> Already have an account? </span>
                <v-btn class="text-none ms-1" to="/login">Login</v-btn>
              </template>
              <v-spacer />
              <v-btn type="submit" variant="flat" :loading class="text-none">
                Start
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
