import { jwtDecode } from 'jwt-decode';
import type { CreateUserDto, User } from '@/components/common/users/types';
import type { RouteLocation } from 'vue-router/auto';
import { useAuthService } from '@/composables/services/useAuthService';
import { useSnackbarStore } from './snackbar';
import type { Project } from '@/components/common/projects/types';
import { useWorkspaceStore } from './workspace';

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
      const { project, ...user } = decodedToken;
      this.setUser(user);
      this.setProject(project);
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
      const { clearSelectedWorkspace } = useWorkspaceStore();
      this.token = null;
      this.user = null;
      this.project = null;
      clearSelectedWorkspace();
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

      const response = await register(user);

      if (response.error) {
        this.handleRegistrationError(response);
      } else {
        this.setToken(response.accessToken);
      }

      return response;
    },

    async registerWithInvite(user: CreateUserDto) {
      const { registerWithInvite } = useAuthService();

      const response = await registerWithInvite(user);

      if (response.error) {
        this.handleRegistrationError(response);
      } else {
        this.setToken(response.accessToken);
      }

      return response;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRegistrationError(response: any) {
      const { showSnackbar } = useSnackbarStore();

      switch (response.error) {
        case 'EMAIL_EXISTS':
          showSnackbar({
            message: 'An account with this email already exists.',
            color: 'error',
          });
          break;
        case 'INVALID_INVITE_CODE':
          showSnackbar({
            message: 'The invitation code provided is invalid.',
            color: 'error',
          });
          break;
        default:
          showSnackbar({
            message: 'Something went wrong, please try again.',
            color: 'error',
          });
          break;
      }
    },
  },
});
