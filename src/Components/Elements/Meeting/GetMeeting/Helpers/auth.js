import CookieService from '../../../../Utils/CookieService';
export const getAuthToken = () => {
    return CookieService.get("token")
  };
  
  export const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    };
  };
  