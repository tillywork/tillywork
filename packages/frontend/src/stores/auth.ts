import { jwtDecode } from 'jwt-decode';
import type { CreateUserDto, User } from '@/components/common/users/types';
import type { RouteLocation } from 'vue-router/auto';
import { useAuthService } from '@/services/useAuthService';
import { useSnackbarStore } from './snackbar';
import type { Project } from '@/components/common/projects/types';
import { useStateStore } from './state';
import type { Workspace } from '@tillywork/shared';

export const useAuthStore = defineStore('auth', {
  persist: true,

  state: () => {
    return {
      user: null as User | null,
      token: null as string | null,
      project: null as Project | null,
      workspace: null as Workspace | null,
    };
  },

  actions: {
    decodeToken(token: string): any {
      return jwtDecode(token);
    },

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

      const { project, ...user } = this.decodeToken(token);
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

    setWorkspace(workspace: Workspace) {
      const stateStore = useStateStore();
      this.workspace = workspace;

      // Ensure that this workspace's expansion state exists in the store
      if (!stateStore.spaceExpansionState[workspace.id]) {
        stateStore.$patch({ spaceExpansionState: { [workspace.id]: [] } });
      }
    },

    /**
     * Logs the user out by
     * clearing the token and user object values
     * saved in store
     */
    logout(go?: RouteLocation) {
      this.token = null;
      this.user = null;
      this.project = null;
      this.workspace = null;
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

    async joinInvitation(inviteCode: string) {
      const { joinInvitation } = useAuthService();

      const response = await joinInvitation(inviteCode);

      if (response.error) {
        this.handleRegistrationError(response);
      } else {
        this.setToken(response.accessToken);
      }

      return response;
    },

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
