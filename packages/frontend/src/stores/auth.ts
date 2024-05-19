import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import type { CreateUserDto, User } from '@/components/common/users/types';
import type { RouteLocation } from 'vue-router/auto';
import { useAuthService } from '@/composables/services/useAuthService';
import { useSnackbarStore } from './snackbar';
import type { Project } from '@/components/common/projects/types';

export const useAuthStore = defineStore('auth', {
  persist: true,

  state: () => {
    return {
      user: null as User | null,
      token: null as string | null,
      project: null as Project | null,
    };
  },

  actions: {
    /**
     * Sets the user object
     * for display on UI
     * @param user The user data
     */
    setUser(user: User) {
      this.user = user;
    },

    /**
     * Sets the token to be injected
     * in the axios instance to
     * authorize user in API
     * @param token The JWT token
     */
    setToken(token: string) {
      this.token = token;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decodedToken: any = jwtDecode(token);
      this.setUser(decodedToken);
    },

    /**
     * Sets the user's currently
     * active project.
     * @param project
     */
    setProject(project: Project) {
      this.project = project;
    },

    /**
     * Logs the user out by
     * clearing the token and user object values
     * saved in store
     */
    logout(go?: RouteLocation) {
      this.token = null;
      this.user = null;
      this.$router.go(go ?? '/');
    },

    /**
     * Checks if there is a token saved in the store
     * @returns boolean
     */
    isAuthenticated() {
      return !!this.token;
    },

    /**
     * Logs the user in through their email and password
     * @param email The user email
     * @param password The user password
     */
    async login(email: string, password: string) {
      const { login } = useAuthService();

      const user = await login({ email, password });

      this.setToken(user.accessToken);
    },

    async register(user: CreateUserDto) {
      const { register } = useAuthService();
      const { showSnackbar } = useSnackbarStore();

      const response = await register(user);

      if (response.error) {
        if (response.error === 'EMAIL_EXISTS') {
          showSnackbar({
            message: 'An account with this email already exists.',
            color: 'error',
            timeout: 5000,
          });
        }
      } else {
        this.setToken(response.accessToken);
      }

      return response;
    },
  },
});
