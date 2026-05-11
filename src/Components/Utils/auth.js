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
      console.log(';error',error)
      // Only handle 401 Unauthorized globally (token expired/invalid)
      if (error.response && error.response.status === 401) {
        CookieService.remove('token');
        navigate('/');
      } else if (error.response && error.response.status === 403) {
        // Do nothing globally for 403 Forbidden; let local components handle it
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );
};
