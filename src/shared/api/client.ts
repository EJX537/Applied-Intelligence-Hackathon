// Axios HTTP client shared across feature API services.

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  // eslint-disable-next-line no-console
  console.log(`[api] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[api error]', error?.message ?? error);
    return Promise.reject(error);
  },
);

export default apiClient;
