import axios from 'axios';

// ----------------------------------------------------------------
// VITE_API_URL must be set in your .env file:
//   Development:  VITE_API_URL=http://localhost:8000/api
//   Production:   VITE_API_URL=https://your-laravel-api.onrender.com/api
//
// NEVER hardcode localhost or a production URL here.
// ----------------------------------------------------------------
if (!import.meta.env.VITE_API_URL) {
  console.error(
    '[TaskFlow] VITE_API_URL is not set. ' +
    'Create a .env file with VITE_API_URL=http://localhost:8000/api for local development.'
  );
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Auto-logout on 401 if not on auth pages
      if (status === 401) {
        const isAuthRoute =
          window.location.pathname === '/login' ||
          window.location.pathname === '/register';
        if (!isAuthRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
