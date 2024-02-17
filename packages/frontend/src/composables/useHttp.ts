import { ref } from 'vue';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';

let axiosInstance: AxiosInstance;

/**
 * Tries to refresh the user access token
 * if a 401 is returned from the API
 * and a user token is saved in store
 * @param error onReject param from Axios
 * @returns AxiosInstance
 */
const refreshTokenInterceptor = async (error: any) => {
  const { refreshToken, setToken, token } = useAuth();

  if (error.response.status === 401 && !error.config._retry && token) {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        setToken(newToken);
        error.config._retry = true;
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(error.config);
      }
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
};

/**
 * Creates a new Axios instance,
 * sets the base URL,
 * and injects the user access token saved in store
 * in the request headers
 * @returns AxiosInstance
 */
const createAxiosInstance = () => {
  const { token } = useAuth();
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    refreshTokenInterceptor
  );

  return instance;
};

export function useHttp() {
  const data = ref<any | null>(null);
  const error = ref<unknown | undefined>(undefined);
  const loading = ref(false);
  axiosInstance = createAxiosInstance();

  /**
   * Sends an HTTP request using the created Axios instance.
   * Response is saved in the data ref.
   * Errors are caught and filled in the error ref.
   * @param endpoint The endpoint to send the request to
   * @param options AxiosRequestConfig
   */
  const sendRequest = async (
    endpoint: string,
    options?: AxiosRequestConfig
  ) => {
    loading.value = true;
    error.value = undefined; // Reset the error before new request

    try {
      const response = await axiosInstance.request({
        url: `${endpoint}`,
        method: options?.method || 'get',
        headers: options?.headers,
        data: options?.data,
        ...options, // Spreading the rest of options in case there are other Axios-specific properties
      });

      data.value = response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Check if error response is available and use it
        error.value = (err.response && err.response.data) || err.message;
      } else {
        error.value = err;
      }
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, sendRequest };
}
