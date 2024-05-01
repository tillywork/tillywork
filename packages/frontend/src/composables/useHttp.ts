import { useAuthStore } from '@/stores/auth';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';


let axiosInstance: AxiosInstance;

/**
 * Tries to refresh the user access token
 * if a 401 is returned from the API
 * and a user token is saved in store
 * @param error onReject param from Axios
 * @returns AxiosInstance
 */
const refreshTokenInterceptor = async (error: any) => {
  const { refreshToken, setToken, token } = useAuthStore();

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
  const { token } = useAuthStore();
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
  axiosInstance = createAxiosInstance();

  /**
   * Sends an HTTP request using the created Axios instance.
   * and returns the response data.
   * Errors are not caught here.
   * @param endpoint The endpoint to send the request to
   * @param options AxiosRequestConfig
   */
  const sendRequest = async (
    endpoint: string,
    options?: AxiosRequestConfig
  ) => {
    const response = await axiosInstance.request({
      url: `${endpoint}`,
      method: options?.method || 'get',
      headers: options?.headers,
      data: options?.data,
      ...options, // Spreading the rest of options in case there are other Axios-specific properties
    });

    return response.data;
  };

  return {
    sendRequest,
  };
}
