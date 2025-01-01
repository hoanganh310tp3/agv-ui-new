import axios from "axios";
import { store } from "../redux/store";

// Define public routes that don't need authorization
const PUBLIC_ROUTES = [
  'agv_identify',
  'login',
  'register',
  'logout',
  'orders',
  'schedules',
  // Add more public routes here
];

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if the current route needs authorization
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      config.url?.includes(route)
    );

    if (!isPublicRoute) {
      const access_token = store?.getState()?.user?.account?.access_token;
      if (access_token) {
        config.headers["Authorization"] = `Bearer ${access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
