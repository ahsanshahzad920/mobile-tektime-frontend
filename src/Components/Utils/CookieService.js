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

    /**
     * PROFESSIONAL SOLUTION:
     * Browser cookies have a strict 4KB limit. Large objects like "userData" with 
     * nested teams/needs will fail to store. We use localStorage for large items
     * or specific keys while keeping tokens/IDs in cookies for standard handling.
     */
    if (stringifiedValue.length > 3800 || key === 'user') {
      localStorage.setItem(key, stringifiedValue);
      // Clean up cookie to prevent stale data or confusion
      Cookies.remove(key, { path: '/' });
    } else {
      Cookies.set(key, stringifiedValue, defaultOptions);
      // Clean up localStorage if it exists from previous large state
      localStorage.removeItem(key);
    }
  },

  get: (key) => {
    // Priority: Check localStorage first (for large items), then fall back to Cookies
    const val = localStorage.getItem(key) || Cookies.get(key);
    if (!val || val === 'undefined') return null;
    return val;
  },

  remove: (key, options = {}) => {
    localStorage.removeItem(key);
    Cookies.remove(key, { path: '/', ...options });
  },

  clear: () => {
    // 1. Clear all cookies
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
    
    // 2. Clear localStorage (related to app)
    // In a professional app, we might only clear app-specific keys, 
    // but usually on logout, we want a clean slate.
    localStorage.clear();
    sessionStorage.clear();
  }
};

export default CookieService;
