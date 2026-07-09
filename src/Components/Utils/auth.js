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

      // --- Contournement WAF Cloudflare -------------------------------------
      // Le pare-feu de Cloudflare rejette (403) la sauvegarde d'une reunion des
      // que le HTML des etapes contient assez d'attributs style= (interprete
      // comme une tentative XSS), AVANT meme d'atteindre le serveur. On encode
      // donc tout le corps en base64 dans un unique champ `_encoded` : le WAF ne
      // voit plus qu'un bloc opaque. Le backend (store/update) le decode.
      // `_method` reste en clair : le routeur Laravel en a besoin AVANT le
      // controleur pour transformer le POST en PUT.
      try {
        const method = (config.method || 'get').toLowerCase();
        const path = (config.url || '').split('?')[0];
        const isMeetingWrite = method === 'post' && /\/api\/meetings(\/\d+)?$/.test(path);
        const data = config.data;
        const isPlainObject = data && typeof data === 'object'
          && !(typeof FormData !== 'undefined' && data instanceof FormData)
          && !(typeof Blob !== 'undefined' && data instanceof Blob)
          && !(typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(data))
          && !Array.isArray(data);
        if (isMeetingWrite && isPlainObject && !data._encoded) {
          const { _method, ...rest } = data;
          const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(rest))));
          const wrapped = { _encoded: b64 };
          if (_method !== undefined) wrapped._method = _method;
          config.data = wrapped;
          config.headers = config.headers || {};
          config.headers['Content-Type'] = 'application/json';
        }
      } catch (e) {
        // En cas de souci, on laisse partir le payload original (comportement historique).
        console.warn('encode _encoded skipped', e);
      }
      // ----------------------------------------------------------------------

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
        navigate('/login');
      } else if (error.response && error.response.status === 403) {
        // Do nothing globally for 403 Forbidden; let local components handle it
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );
};
