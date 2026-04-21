import CookieService from './CookieService';
import axios from 'axios';
import { API_BASE_URL } from '../Apicongfig';
import { useNavigate } from 'react-router-dom';

export const setupAxiosInterceptors = (navigate) => {
  axios.interceptors.request.use(
    (config) => {
      const token = CookieService.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Do NOT navigate or reject here if no token
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        CookieService.remove('token');
        navigate('/');
      }
      return Promise.reject(error);
    }
  );
};
