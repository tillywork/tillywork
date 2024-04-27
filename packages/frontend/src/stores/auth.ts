import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { useHttp } from '@/composables/useHttp';

export const useAuthStore = defineStore('auth', {
  persist: true,

  state: () => {
    return {
      user: null as any | null,
      token: null as string | null,
      selectedProjectId: null as number | null,
    };
  },

  actions: {
    /**
     * Sets the selected project ID
     * to navigate user to project
     * @param projectId The ID of the project
     */
    setSelectedProject(projectId: number) {
      this.selectedProjectId = projectId;
    },
    /**
     * Sets the user object
     * for display on UI
     * @param user The user data
     */
    setUser(user: any) {
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

      const decodedToken: any = jwtDecode(token);
      this.setUser(decodedToken);
    },
    /**
     * Logs the user out by
     * clearing the token and user object values
     * saved in store
     */
    logout(go?: any) {
      this.token = null;
      this.user = null;
      this.selectedProjectId = null;
      this.$router.go(go ?? { name: 'Home' });
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
     * and reloads the page to inject token in Axios
     * and display user information on frontend
     * @param email The user email
     * @param password The user password
     */
    async login(email: string, password: string) {
      const { sendRequest } = useHttp();

      const user = await sendRequest('/auth/login', {
        method: 'POST',
        data: { email, password },
      });

      this.setToken(user.accessToken);
    },

    /**
     * Refreshes an expired token
     * by exchanging the token through
     * the API or redirects user to 
     * login page if it fails
     */
    async refreshToken() {
      try {
        const { sendRequest } = useHttp();

        const user = await sendRequest('/auth/refresh', {
          method: 'POST',
        });

        this.setToken(user.accessToken);
      } catch (error) {
        // Refreshing an expired token failed, redirect user to login
        this.logout({ name: 'Login' });
      }
    },
  },
});
