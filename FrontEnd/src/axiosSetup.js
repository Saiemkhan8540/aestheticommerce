import axios from "axios";
import { logoutUser } from "./Redux/authSlice.js";

/**
 * Set up axios response interceptor to logout on 401 (invalid/expired token).
 * Call once at app init with the Redux store.
 */
export function setupAxiosInterceptor(store) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(logoutUser());
      }
      return Promise.reject(error);
    },
  );
}
