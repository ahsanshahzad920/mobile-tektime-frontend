import Cookies from 'js-cookie';

const CookieService = {
  set: (key, value, options = {}) => {
    // Default options for professional/secure cookie handling
    const defaultOptions = { 
      expires: 30, 
      path: '/', 
      secure: window.location.protocol === 'https:', // Only send over HTTPS if available
      sameSite: 'Lax', // Protects against CSRF
      ...options 
    };
    
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    Cookies.set(key, stringifiedValue, defaultOptions);
  },

  get: (key) => {
    const val = Cookies.get(key);
    if (!val || val === 'undefined') return null;
    return val;
  },

  remove: (key, options = {}) => {
    Cookies.remove(key, { path: '/', ...options });
  },

  clear: () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
  }
};

export default CookieService;
